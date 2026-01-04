import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, getTenantBySlug, successResponse, errorResponse } from "../_shared/utils.ts";
import { monitor, createContext } from "../_shared/monitoring.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const context = createContext('validate-coupon', req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { store_slug, coupon_code, cart_subtotal, customer_id } = await req.json();

    if (!store_slug || !coupon_code) {
      return errorResponse('Missing required fields', 400);
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

    // Get coupon by code
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('code', coupon_code.toUpperCase().trim())
      .maybeSingle();

    if (couponError || !coupon) {
      return successResponse({ error: 'Invalid coupon code', valid: false });
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return successResponse({ error: 'Coupon is not active', valid: false });
    }

    // Check expiry date
    if (coupon.expires_at) {
      const expiryDate = new Date(coupon.expires_at);
      const now = new Date();
      if (expiryDate < now) {
        return successResponse({ error: 'Coupon has expired', valid: false });
      }
    }

    // Check start date
    if (coupon.starts_at) {
      const startDate = new Date(coupon.starts_at);
      const now = new Date();
      if (startDate > now) {
        return successResponse({ error: 'Coupon is not yet active', valid: false });
      }
    }

    // Check minimum purchase amount
    if (coupon.min_purchase_amount && cart_subtotal < coupon.min_purchase_amount) {
      return successResponse({
        error: `Minimum purchase amount of ₹${coupon.min_purchase_amount} required`,
        valid: false,
      });
    }

    // Check usage limits (if customer_id provided)
    if (customer_id && coupon.usage_limit_per_customer) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('customer_id', customer_id)
        .eq('coupon_code', coupon.code);

      if (count && count >= coupon.usage_limit_per_customer) {
        return successResponse({
          error: 'You have already used this coupon',
          valid: false,
        });
      }
    }

    // Check total usage limit
    if (coupon.usage_limit) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('coupon_code', coupon.code);

      if (count && count >= coupon.usage_limit) {
        return successResponse({
          error: 'Coupon usage limit reached',
          valid: false,
        });
      }
    }

    // Calculate discount
    let discount_amount = 0;
    if (coupon.discount_type === 'percentage') {
      discount_amount = (cart_subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discount_amount = Math.min(discount_amount, coupon.max_discount_amount);
      }
    } else {
      discount_amount = coupon.discount_value;
    }

    discount_amount = Math.min(discount_amount, cart_subtotal); // Don't exceed cart total

    return successResponse({
      valid: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: Math.round(discount_amount * 100) / 100,
        description: coupon.description,
      },
    });

  } catch (error) {
    await monitor.logError(error, context);
    return errorResponse('Internal server error', 500, error);
  }
});
