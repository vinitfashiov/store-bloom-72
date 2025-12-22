import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { store_slug, order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    console.log('Verifying Razorpay payment:', { store_slug, order_id, razorpay_order_id, razorpay_payment_id });

    if (!store_slug || !order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Resolve tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, plan, trial_ends_at, is_active')
      .eq('store_slug', store_slug)
      .single();

    if (tenantError || !tenant) {
      console.error('Tenant not found:', tenantError);
      return new Response(
        JSON.stringify({ success: false, error: 'Store not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check tenant is active
    const now = new Date();
    const trialEndsAt = new Date(tenant.trial_ends_at);
    const isActive = tenant.plan === 'pro' || now < trialEndsAt;

    if (!isActive || !tenant.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: 'Store subscription expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load Razorpay secret
    const { data: integration, error: integrationError } = await supabase
      .from('tenant_integrations')
      .select('razorpay_key_secret')
      .eq('tenant_id', tenant.id)
      .single();

    if (integrationError || !integration?.razorpay_key_secret) {
      console.error('Razorpay not configured:', integrationError);
      return new Response(
        JSON.stringify({ success: false, error: 'Razorpay not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify signature using HMAC SHA256
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(integration.razorpay_key_secret);
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = signatureHex === razorpay_signature;
    console.log('Signature verification:', { isValid, computed: signatureHex, received: razorpay_signature });

    if (isValid) {
      // Update order as paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          razorpay_payment_id,
        })
        .eq('id', order_id)
        .eq('tenant_id', tenant.id);

      if (updateError) {
        console.error('Failed to update order:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Payment verified and order updated successfully');
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Mark payment as failed
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', order_id)
        .eq('tenant_id', tenant.id);

      console.error('Invalid signature');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in verify-razorpay-payment:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
