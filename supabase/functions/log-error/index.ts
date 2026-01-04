import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, successResponse, errorResponse } from "../_shared/utils.ts";
import { monitor, createContext } from "../_shared/monitoring.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const logData = await req.json();
    const supabase = getSupabaseClient();

    await supabase
      .from('application_logs')
      .insert({
        level: logData.level || 'error',
        message: logData.message || 'Unknown error',
        stack: logData.stack,
        context: logData.context || {},
        tenant_id: logData.context?.tenantId || null,
        user_id: logData.context?.userId || null,
      });

    return successResponse({ success: true });
  } catch (error) {
    console.error('Error logging error:', error);
    return errorResponse('Failed to log error', 500);
  }
});

