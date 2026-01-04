import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShiprocketWebhookPayload {
  shipment_id?: string;
  order_id?: string;
  awb_code?: string;
  status?: string;
  status_code?: string;
  current_status?: string;
  courier_name?: string;
  tracking_data?: {
    shipment_track?: Array<{
      current_status?: string;
      current_status_code?: string;
      current_status_location?: string;
      current_status_time?: string;
    }>;
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

    const payload: ShiprocketWebhookPayload = await req.json();
    console.log('Processing Shiprocket webhook:', payload);

    // Find shipment by order_id or shipment_id
    let shipmentId: string | null = null;
    let tenantId: string | null = null;
    let orderId: string | null = null;

    if (payload.order_id) {
      const { data: shipment } = await supabase
        .from('shiprocket_shipments')
        .select('id, tenant_id, order_id, shiprocket_order_id')
        .eq('shiprocket_order_id', payload.order_id.toString())
        .maybeSingle();

      if (shipment) {
        shipmentId = shipment.id;
        tenantId = shipment.tenant_id;
        orderId = shipment.order_id;
      }
    }

    if (!shipmentId && payload.shipment_id) {
      const { data: shipment } = await supabase
        .from('shiprocket_shipments')
        .select('id, tenant_id, order_id, shipment_id')
        .eq('shipment_id', payload.shipment_id.toString())
        .maybeSingle();

      if (shipment) {
        shipmentId = shipment.id;
        tenantId = shipment.tenant_id;
        orderId = shipment.order_id;
      }
    }

    if (!tenantId || !orderId) {
      console.error('Shipment not found for webhook');
      return new Response(
        JSON.stringify({ error: 'Shipment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine webhook type
    const webhookType = payload.status || payload.current_status || 'shipment.update';

    // Save webhook
    const { data: webhook, error: webhookError } = await supabase
      .from('shipping_webhooks')
      .insert({
        tenant_id: tenantId,
        shipment_id: shipmentId,
        order_id: orderId,
        webhook_type: webhookType,
        shiprocket_event_id: payload.shipment_id || payload.order_id,
        payload: payload,
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Failed to save webhook:', webhookError);
    }

    // Process webhook
    try {
      // Update shipment status
      if (shipmentId) {
        await supabase
          .from('shiprocket_shipments')
          .update({
            status: payload.status || payload.current_status,
            last_tracking_status: payload.status || payload.current_status,
            last_tracking_update_at: new Date().toISOString(),
            awb_code: payload.awb_code || undefined,
            courier_name: payload.courier_name || undefined,
          })
          .eq('id', shipmentId);
      }

      // Create tracking update
      if (payload.tracking_data?.shipment_track && payload.tracking_data.shipment_track.length > 0) {
        const latestTrack = payload.tracking_data.shipment_track[0];
        
        await supabase
          .from('shipping_tracking_updates')
          .insert({
            tenant_id: tenantId,
            shipment_id: shipmentId!,
            order_id: orderId!,
            status: latestTrack.current_status || payload.status || 'unknown',
            location: latestTrack.current_status_location,
            timestamp: latestTrack.current_status_time 
              ? new Date(latestTrack.current_status_time).toISOString()
              : new Date().toISOString(),
            courier_name: payload.courier_name,
            awb_code: payload.awb_code,
            raw_data: payload,
          });
      }

      // Update order status based on shipment status
      if (orderId && payload.status) {
        let orderStatus = null;
        
        switch (payload.status.toLowerCase()) {
          case 'delivered':
            orderStatus = 'delivered';
            break;
          case 'out_for_delivery':
          case 'in_transit':
            orderStatus = 'shipped';
            break;
          case 'rto':
            orderStatus = 'cancelled';
            break;
        }

        if (orderStatus) {
          await supabase
            .from('orders')
            .update({ status: orderStatus })
            .eq('id', orderId);
        }
      }

      // Mark webhook as processed
      if (webhook) {
        await supabase
          .from('shipping_webhooks')
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq('id', webhook.id);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Schedule retry
      if (webhook) {
        await supabase.rpc('schedule_operation_retry', {
          p_tenant_id: tenantId,
          p_operation_type: 'shipping_webhook',
          p_operation_id: webhook.id,
          p_payload: { webhook_id: webhook.id, event: webhookType },
          p_error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in shiprocket-webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

