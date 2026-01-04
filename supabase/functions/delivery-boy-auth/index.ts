import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, getTenantBySlug, successResponse, errorResponse } from "../_shared/utils.ts";
import { monitor, createContext } from "../_shared/monitoring.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const context = createContext('delivery-boy-auth', req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = getSupabaseClient();

    const { action, mobile_number, password, store_slug } = await req.json();

    if (action === 'login') {
      if (!mobile_number || !password || !store_slug) {
        return errorResponse('Mobile number, password, and store slug are required', 400);
      }

      // Get tenant (cached)
      const tenant = await monitor.trackPerformance(
        'get_tenant',
        () => getTenantBySlug(supabase, store_slug),
        { ...context, store_slug }
      );

      if (!tenant) {
        return errorResponse('Store not found', 404);
      }

      // Check if business type is grocery
      if (tenant.business_type !== 'grocery') {
        return errorResponse('Delivery system not available for this store', 403);
      }

      // Find delivery boy by mobile number and tenant
      const { data: deliveryBoy, error: boyError } = await supabase
        .from('delivery_boys')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('mobile_number', mobile_number)
        .eq('is_active', true)
        .maybeSingle();

      if (boyError || !deliveryBoy) {
        return errorResponse('Invalid credentials', 401);
      }

      // Verify password (simple comparison - in production, use bcrypt)
      if (deliveryBoy.password !== password) {
        return errorResponse('Invalid credentials', 401);
      }

      // Create or update session token (simplified - use proper JWT in production)
      const sessionToken = crypto.randomUUID();

      const { error: sessionError } = await supabase
        .from('delivery_boys')
        .update({
          last_login_at: new Date().toISOString(),
        })
        .eq('id', deliveryBoy.id);

      if (sessionError) {
        await monitor.logError(sessionError, context);
        return errorResponse('Failed to create session', 500);
      }

      return successResponse({
        success: true,
        delivery_boy: {
          id: deliveryBoy.id,
          name: deliveryBoy.name,
          mobile_number: deliveryBoy.mobile_number,
          tenant_id: deliveryBoy.tenant_id,
        },
        token: sessionToken, // In production, use proper JWT
      });

    } else if (action === 'logout') {
      // Handle logout if needed
      return successResponse({ success: true });
    } else {
      return errorResponse('Invalid action', 400);
    }

  } catch (error) {
    await monitor.logError(error, context);
    return errorResponse('Internal server error', 500, error);
  }
});
