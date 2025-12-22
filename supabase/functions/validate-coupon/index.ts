import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { store_slug, coupon_code, cart_subtotal, customer_id } = await req.json();

    if (!store_slug || !coupon_code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, is_active')
      .eq('store_slug', store_slug)
      .eq('is_active', true)
      .maybeSingle();

    if (tenantError || !tenant) {
      console.error('Tenant not found:', tenantError);
      return new Response(
        JSON.stringify({ error: 'Store not found', valid: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get coupon by code
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('code', coupon_code.toUpperCase().trim())
      .maybeSingle();

    if (couponError || !coupon) {
      console.log('Coupon not found:', coupon_code);
      return new Response(
        JSON.stringify({ error: 'Invalid coupon code', valid: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return new Response(
        JSON.stringify({ error: 'Coupon is inactive', valid: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check date validity
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return new Response(
        JSON.stringify({ error: 'Coupon is not yet active', valid: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (coupon.ends_at && new Date(coupon.ends_at) < now) {
      return new Response(
        JSON.stringify({ error: 'Coupon has expired', valid: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check usage limit
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return new Response(
        JSON.stringify({ error: 'Coupon usage limit reached', valid: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check minimum cart amount
    const subtotal = parseFloat(cart_subtotal) || 0;
    const minCartAmount = parseFloat(coupon.min_cart_amount) || 0;
    if (subtotal < minCartAmount) {
      return new Response(
        JSON.stringify({ 
          error: `Minimum cart amount is ₹${minCartAmount}`, 
          valid: false,
          min_cart_amount: minCartAmount
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percent') {
      discountAmount = (subtotal * parseFloat(coupon.value)) / 100;
      // Apply max discount cap if set
      if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
        discountAmount = parseFloat(coupon.max_discount_amount);
      }
    } else {
      // Fixed discount
      discountAmount = parseFloat(coupon.value);
    }

    // Ensure discount doesn't exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    console.log('Coupon validated:', {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      subtotal,
      discountAmount
    });

    return new Response(
      JSON.stringify({
        valid: true,
        coupon_id: coupon.id,
        coupon_code: coupon.code,
        coupon_type: coupon.type,
        coupon_value: coupon.value,
        discount_amount: discountAmount,
        message: coupon.type === 'percent' 
          ? `${coupon.value}% off applied!` 
          : `₹${coupon.value} off applied!`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error validating coupon:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', valid: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});