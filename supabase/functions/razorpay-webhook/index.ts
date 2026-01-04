import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        invoice_id: string | null;
        international: boolean;
        method: string;
        amount_refunded: number;
        refund_status: string | null;
        captured: boolean;
        description: string;
        card_id: string | null;
        bank: string | null;
        wallet: string | null;
        vpa: string | null;
        email: string;
        contact: string;
        notes: Record<string, any>;
        fee: number;
        tax: number;
        error_code: string | null;
        error_description: string | null;
        error_source: string | null;
        error_step: string | null;
        error_reason: string | null;
        acquirer_data: Record<string, any>;
        created_at: number;
      };
    };
    refund?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        payment_id: string;
        notes: Record<string, any>;
        receipt: string | null;
        acquirer_data: Record<string, any>;
        created_at: number;
        batch_id: string | null;
        status: string;
        speed_processed: string;
        speed_requested: string;
      };
    };
    order?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        receipt: string;
        offer_id: string | null;
        status: string;
        attempts: number;
        notes: Record<string, any>;
        created_at: number;
      };
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get webhook signature from header
    const webhookSignature = req.headers.get('X-Razorpay-Signature');
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const payload: RazorpayWebhookPayload = JSON.parse(rawBody);

    // Verify webhook signature
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(rawBody)
    );

    const signatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signatureHex !== webhookSignature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing Razorpay webhook:', payload.event);

    // Find tenant by payment/order
    let tenantId: string | null = null;
    let paymentIntentId: string | null = null;
    let orderId: string | null = null;

    if (payload.payload.payment) {
      const payment = payload.payload.payment.entity;
      
      // Find payment intent by razorpay_order_id or razorpay_payment_id
      const { data: paymentIntent } = await supabase
        .from('payment_intents')
        .select('id, tenant_id, razorpay_order_id, razorpay_payment_id')
        .or(`razorpay_order_id.eq.${payment.order_id},razorpay_payment_id.eq.${payment.id}`)
        .maybeSingle();

      if (paymentIntent) {
        tenantId = paymentIntent.tenant_id;
        paymentIntentId = paymentIntent.id;
      }

      // Find order by razorpay_payment_id
      const { data: order } = await supabase
        .from('orders')
        .select('id, tenant_id')
        .eq('razorpay_payment_id', payment.id)
        .maybeSingle();

      if (order) {
        tenantId = order.tenant_id;
        orderId = order.id;
      }
    }

    if (!tenantId) {
      console.error('Tenant not found for webhook');
      return new Response(
        JSON.stringify({ error: 'Tenant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save webhook
    const { data: webhook, error: webhookError } = await supabase
      .from('payment_webhooks')
      .insert({
        tenant_id: tenantId,
        payment_intent_id: paymentIntentId,
        order_id: orderId,
        webhook_type: payload.event,
        razorpay_event_id: payload.account_id,
        razorpay_payment_id: payload.payload.payment?.entity.id || payload.payload.refund?.entity.payment_id,
        razorpay_order_id: payload.payload.payment?.entity.order_id || payload.payload.order?.entity.id,
        payload: payload,
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Failed to save webhook:', webhookError);
    }

    // Process webhook based on event type
    try {
      switch (payload.event) {
        case 'payment.captured':
          await handlePaymentCaptured(supabase, payload, tenantId, orderId, paymentIntentId);
          break;
        case 'payment.failed':
          await handlePaymentFailed(supabase, payload, tenantId, orderId, paymentIntentId);
          break;
        case 'refund.created':
          await handleRefundCreated(supabase, payload, tenantId, orderId);
          break;
        case 'refund.processed':
          await handleRefundProcessed(supabase, payload, tenantId, orderId);
          break;
        default:
          console.log('Unhandled webhook event:', payload.event);
      }

      // Mark webhook as processed
      if (webhook) {
        await supabase
          .from('payment_webhooks')
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq('id', webhook.id);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Schedule retry
      if (webhook) {
        await supabase.rpc('schedule_operation_retry', {
          p_tenant_id: tenantId,
          p_operation_type: 'payment_webhook',
          p_operation_id: webhook.id,
          p_payload: { webhook_id: webhook.id, event: payload.event },
          p_error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in razorpay-webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handlePaymentCaptured(
  supabase: any,
  payload: RazorpayWebhookPayload,
  tenantId: string,
  orderId: string | null,
  paymentIntentId: string | null
) {
  const payment = payload.payload.payment?.entity;
  if (!payment) return;

  // Update payment intent
  if (paymentIntentId) {
    await supabase
      .from('payment_intents')
      .update({
        status: 'paid',
        razorpay_payment_id: payment.id,
      })
      .eq('id', paymentIntentId);
  }

  // Update order payment status
  if (orderId) {
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: payment.id,
      })
      .eq('id', orderId);

    // Create reconciliation record
    const { data: order } = await supabase
      .from('orders')
      .select('total')
      .eq('id', orderId)
      .single();

    if (order) {
      await supabase
        .from('payment_reconciliation')
        .insert({
          tenant_id: tenantId,
          order_id: orderId,
          payment_intent_id: paymentIntentId,
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          expected_amount: order.total,
          received_amount: payment.amount / 100, // Convert from paise
          status: payment.amount / 100 === order.total ? 'matched' : 'mismatch',
        });
    }
  }
}

async function handlePaymentFailed(
  supabase: any,
  payload: RazorpayWebhookPayload,
  tenantId: string,
  orderId: string | null,
  paymentIntentId: string | null
) {
  const payment = payload.payload.payment?.entity;
  if (!payment) return;

  // Update payment intent
  if (paymentIntentId) {
    await supabase
      .from('payment_intents')
      .update({ status: 'failed' })
      .eq('id', paymentIntentId);
  }

  // Update order payment status
  if (orderId) {
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
      })
      .eq('id', orderId);
  }
}

async function handleRefundCreated(
  supabase: any,
  payload: RazorpayWebhookPayload,
  tenantId: string,
  orderId: string | null
) {
  const refund = payload.payload.refund?.entity;
  if (!refund || !orderId) return;

  // Create refund record
  await supabase
    .from('refunds')
    .insert({
      tenant_id: tenantId,
      order_id: orderId,
      razorpay_refund_id: refund.id,
      razorpay_payment_id: refund.payment_id,
      amount: refund.amount / 100, // Convert from paise
      status: 'initiated',
    });

  // Update order refund amount
  const { data: order } = await supabase
    .from('orders')
    .select('total_refunded')
    .eq('id', orderId)
    .single();

  if (order) {
    await supabase
      .from('orders')
      .update({
        total_refunded: (order.total_refunded || 0) + refund.amount / 100,
      })
      .eq('id', orderId);
  }
}

async function handleRefundProcessed(
  supabase: any,
  payload: RazorpayWebhookPayload,
  tenantId: string,
  orderId: string | null
) {
  const refund = payload.payload.refund?.entity;
  if (!refund || !orderId) return;

  // Update refund status
  await supabase
    .from('refunds')
    .update({
      status: refund.status === 'processed' ? 'processed' : 'failed',
      processed_at: new Date(refund.created_at * 1000).toISOString(),
    })
    .eq('razorpay_refund_id', refund.id);
}

