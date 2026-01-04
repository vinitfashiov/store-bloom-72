import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, getTenantBySlug, getTenantIntegrations, successResponse, errorResponse } from "../_shared/utils.ts";
import { monitor, createContext } from "../_shared/monitoring.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const context = createContext('create-razorpay-order', req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { store_slug, payment_intent_id } = await req.json();

    if (!store_slug || !payment_intent_id) {
      return errorResponse('Missing store_slug or payment_intent_id', 400);
    }

    const supabase = getSupabaseClient();

    // Get tenant (cached)
    const tenant = await monitor.trackPerformance(
      'get_tenant',
      () => getTenantBySlug(supabase, store_slug),
      { ...context, store_slug }
    );

    if (!tenant) {
      return errorResponse('Store not found', 404);
    }

    // Check tenant is active
    const now = new Date();
    const trialEndsAt = new Date(tenant.trial_ends_at);
    const isActive = tenant.plan === 'pro' || now < trialEndsAt;

    if (!isActive || !tenant.is_active) {
      return errorResponse('Store subscription expired', 403);
    }

    // Get integrations (cached)
    const integration = await monitor.trackPerformance(
      'get_integrations',
      () => getTenantIntegrations(supabase, tenant.id),
      { ...context, tenantId: tenant.id }
    );

    if (!integration?.razorpay_key_id || !integration?.razorpay_key_secret) {
      return errorResponse('Payment gateway not configured', 400);
    }

    // Get payment intent
    const { data: paymentIntent, error: piError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('id', payment_intent_id)
      .eq('tenant_id', tenant.id)
      .single();

    if (piError || !paymentIntent) {
      return errorResponse('Payment intent not found', 404);
    }

    // Create Razorpay order
    const razorpayResponse = await monitor.trackPerformance(
      'razorpay_create_order',
      async () => {
        return await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${integration.razorpay_key_id}:${integration.razorpay_key_secret}`),
          },
          body: JSON.stringify({
            amount: Math.round(paymentIntent.amount * 100), // Razorpay expects paise
            currency: 'INR',
            receipt: paymentIntent.id.substring(0, 40),
            notes: {
              tenant_id: tenant.id,
              payment_intent_id: paymentIntent.id,
            },
          }),
        });
      },
      { ...context, tenantId: tenant.id, paymentIntentId: payment_intent_id }
    );

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      await monitor.logError(new Error(`Razorpay error: ${JSON.stringify(errorData)}`), context);
      return errorResponse('Failed to create Razorpay order', 500);
    }

    const razorpayOrder = await razorpayResponse.json();

    // Update payment intent with Razorpay order ID
    const { error: updateError } = await supabase
      .from('payment_intents')
      .update({
        razorpay_order_id: razorpayOrder.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment_intent_id);

    if (updateError) {
      await monitor.logError(updateError, context);
      return errorResponse('Failed to update payment intent', 500);
    }

    return successResponse({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: integration.razorpay_key_id,
    });

  } catch (error) {
    await monitor.logError(error, context);
    return errorResponse('Internal server error', 500, error);
  }
});
