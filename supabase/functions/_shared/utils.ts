/**
 * Shared utilities for Edge Functions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCache, cached, CacheKeys } from "./cache.ts";
import { monitor, createContext } from "./monitoring.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Get Supabase client (cached)
 */
export function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Get tenant by slug (cached)
 */
export async function getTenantBySlug(
  supabase: ReturnType<typeof getSupabaseClient>,
  slug: string
) {
  const cacheKey = CacheKeys.tenant(slug);
  
  return cached(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, store_name, store_slug, plan, trial_ends_at, is_active, business_type')
        .eq('store_slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    300 // 5 minutes cache
  );
}

/**
 * Get tenant by domain (cached)
 */
export async function getTenantByDomain(
  supabase: ReturnType<typeof getSupabaseClient>,
  domain: string
) {
  const cacheKey = CacheKeys.domainTenant(domain.toLowerCase());
  
  return cached(
    cacheKey,
    async () => {
      // First get domain record
      const { data: domainData, error: domainError } = await supabase
        .from('custom_domains')
        .select('tenant_id')
        .eq('domain', domain.toLowerCase())
        .eq('status', 'active')
        .maybeSingle();

      if (domainError || !domainData) {
        return null;
      }

      // Then get tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id, store_name, store_slug, plan, trial_ends_at, is_active, business_type')
        .eq('id', domainData.tenant_id)
        .eq('is_active', true)
        .maybeSingle();

      if (tenantError || !tenantData) {
        return null;
      }

      return tenantData;
    },
    300 // 5 minutes cache
  );
}

/**
 * Get tenant integrations (cached)
 */
export async function getTenantIntegrations(
  supabase: ReturnType<typeof getSupabaseClient>,
  tenantId: string
) {
  const cacheKey = CacheKeys.integration(tenantId);
  
  return cached(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('tenant_integrations')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    600 // 10 minutes cache (integrations don't change often)
  );
}

/**
 * Clear tenant-related cache
 */
export async function invalidateTenantCache(tenantId: string, slug?: string): Promise<void> {
  const cache = getCache();
  await cache.delete(CacheKeys.tenantById(tenantId));
  if (slug) {
    await cache.delete(CacheKeys.tenant(slug));
  }
  await cache.delete(CacheKeys.integration(tenantId));
  await cache.delete(CacheKeys.storeSettings(tenantId));
}

/**
 * Clear domain cache
 */
export async function invalidateDomainCache(domain: string): Promise<void> {
  const cache = getCache();
  await cache.delete(CacheKeys.domain(domain.toLowerCase()));
  await cache.delete(CacheKeys.domainTenant(domain.toLowerCase()));
}

/**
 * Error response helper
 */
export function errorResponse(
  message: string,
  status: number = 400,
  error?: unknown
): Response {
  if (error) {
    console.error('Error:', error);
  }

  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Success response helper
 */
export function successResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

