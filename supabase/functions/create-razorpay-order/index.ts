import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { store_slug, payment_intent_id } = await req.json();
    console.log('Creating Razorpay order for payment intent:', { store_slug, payment_intent_id });

    if (!store_slug || !payment_intent_id) {
      return new Response(
        JSON.stringify({ error: 'Missing store_slug or payment_intent_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Resolve tenant by store_slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, plan, trial_ends_at, is_active')
      .eq('store_slug', store_slug)
      .single();

    if (tenantError || !tenant) {
      console.error('Tenant not found:', tenantError);
      return new Response(
        JSON.stringify({ error: 'Store not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check tenant is active
    const now = new Date();
    const trialEndsAt = new Date(tenant.trial_ends_at);
    const isActive = tenant.plan === 'pro' || now < trialEndsAt;

    if (!isActive || !tenant.is_active) {
      console.error('Tenant inactive:', tenant.id);
      return new Response(
        JSON.stringify({ error: 'Store subscription expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load Razorpay credentials
    const { data: integration, error: integrationError } = await supabase
      .from('tenant_integrations')
      .select('razorpay_key_id, razorpay_key_secret')
      .eq('tenant_id', tenant.id)
      .single();

    if (integrationError || !integration?.razorpay_key_id || !integration?.razorpay_key_secret) {
      console.error('Razorpay not configured:', integrationError);
      return new Response(
        JSON.stringify({ error: 'Razorpay not configured for this store' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the payment intent
    const { data: paymentIntent, error: piError } = await supabase
      .from('payment_intents')
      .select('id, amount, tenant_id, status, draft_order_data')
      .eq('id', payment_intent_id)
      .eq('tenant_id', tenant.id)
      .single();

    if (piError || !paymentIntent) {
      console.error('Payment intent not found:', piError);
      return new Response(
        JSON.stringify({ error: 'Payment intent not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (paymentIntent.status !== 'initiated') {
      console.error('Payment intent already processed:', paymentIntent.status);
      return new Response(
        JSON.stringify({ error: `Payment intent already ${paymentIntent.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Razorpay order
    const amount = Math.round(paymentIntent.amount * 100); // Convert to paise
    const razorpayAuth = btoa(`${integration.razorpay_key_id}:${integration.razorpay_key_secret}`);
    const draftData = paymentIntent.draft_order_data as { order_number?: string };
    const receipt = draftData?.order_number || `PI-${payment_intent_id.substring(0, 8)}`;

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt,
      }),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.text();
      console.error('Razorpay API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create Razorpay order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created:', razorpayOrder.id);

    // Update payment intent with razorpay_order_id and status
    const { error: updateError } = await supabase
      .from('payment_intents')
      .update({ 
        razorpay_order_id: razorpayOrder.id,
        status: 'razorpay_order_created'
      })
      .eq('id', payment_intent_id);

    if (updateError) {
      console.error('Failed to update payment intent:', updateError);
    }

    return new Response(
      JSON.stringify({
        key_id: integration.razorpay_key_id,
        razorpay_order_id: razorpayOrder.id,
        amount,
        currency: 'INR',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-razorpay-order:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
