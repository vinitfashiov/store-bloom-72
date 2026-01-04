import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, successResponse, errorResponse, invalidateDomainCache } from "../_shared/utils.ts";
import { monitor, createContext } from "../_shared/monitoring.ts";
import { cached, CacheKeys } from "../_shared/cache.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPECTED_IP = "185.158.133.1";

interface DnsResponse {
  Answer?: Array<{
    type: number;
    data: string;
  }>;
}

/**
 * Check DNS records (cached for 30 seconds to avoid rate limits)
 */
async function checkDNSRecords(domain: string): Promise<DnsResponse> {
  const cacheKey = CacheKeys.generateKey('dns', domain);
  
  return cached(
    cacheKey,
    async () => {
      const dnsUrl = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`;
      
      const dnsResponse = await fetch(dnsUrl, {
        headers: { 'Accept': 'application/dns-json' }
      });

      if (!dnsResponse.ok) {
        throw new Error('DNS lookup failed');
      }

      return await dnsResponse.json() as DnsResponse;
    },
    30 // 30 seconds cache for DNS lookups
  );
}

serve(async (req) => {
  const context = createContext('verify-domain-dns', req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, domain_id } = await req.json();

    if (!domain || !domain_id) {
      return errorResponse('Domain and domain_id are required', 400);
    }

    const supabase = getSupabaseClient();

    // Get domain info
    const { data: domainInfo, error: domainError } = await supabase
      .from('custom_domains')
      .select('tenant_id, verification_attempts, status')
      .eq('id', domain_id)
      .single();

    if (domainError || !domainInfo) {
      return errorResponse('Domain not found', 404);
    }

    // Check DNS records with caching
    const dnsData = await monitor.trackPerformance(
      'dns_lookup',
      () => checkDNSRecords(domain),
      { ...context, domain }
    );

    const aRecords = dnsData.Answer?.filter(r => r.type === 1) || [];
    const hasCorrectARecord = aRecords.some(r => r.data === EXPECTED_IP);

    // Log verification attempt
    await supabase
      .from('domain_verification_logs')
      .insert({
        domain_id,
        tenant_id: domainInfo.tenant_id,
        verified: hasCorrectARecord,
        dns_records: { a_records: aRecords.map(r => r.data) },
        error_message: hasCorrectARecord ? null : 'A record does not match expected IP',
      });

    // Update verification attempts
    await supabase
      .from('custom_domains')
      .update({
        verification_attempts: (domainInfo.verification_attempts || 0) + 1,
        last_verification_at: new Date().toISOString(),
        verification_error: hasCorrectARecord ? null : 'A record does not match expected IP',
      })
      .eq('id', domain_id);

    if (!hasCorrectARecord) {
      const currentIps = aRecords.map(r => r.data).join(', ') || 'none';
      
      // Schedule retry if auto_verify is enabled
      const { data: domainSettings } = await supabase
        .from('custom_domains')
        .select('auto_verify')
        .eq('id', domain_id)
        .single();

      if (domainSettings?.auto_verify) {
        await supabase.rpc('schedule_operation_retry', {
          p_tenant_id: domainInfo.tenant_id,
          p_operation_type: 'domain_verify',
          p_operation_id: domain_id,
          p_payload: { domain, domain_id },
          p_error_message: `A records point to ${currentIps} instead of ${EXPECTED_IP}`,
        });
      }

      return successResponse({
        verified: false,
        current_records: currentIps,
        expected_ip: EXPECTED_IP,
        message: aRecords.length === 0 
          ? 'No A records found. Please add the required DNS records.'
          : `A records point to ${currentIps} instead of ${EXPECTED_IP}. Please update your DNS settings.`
      });
    }

    // DNS verified - update the domain status to active
    const { error: updateError } = await supabase
      .from('custom_domains')
      .update({ 
        status: 'active',
        verification_error: null,
      })
      .eq('id', domain_id);

    if (updateError) {
      await monitor.logError(updateError, { ...context, domain, domain_id });
      return successResponse({
        verified: true,
        activated: false,
        error: 'DNS verified but failed to activate domain'
      });
    }

    // Clear domain cache after successful verification
    await invalidateDomainCache(domain);

    await monitor.logInfo(`Domain ${domain} verified and activated`, { ...context, domain, domain_id });

    return successResponse({
      verified: true,
      activated: true,
      message: 'Domain DNS verified and activated successfully!'
    });

  } catch (error) {
    await monitor.logError(error, context);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse('Internal server error', 500, error);
  }
});
