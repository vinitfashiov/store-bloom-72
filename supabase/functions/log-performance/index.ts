import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSupabaseClient, successResponse, errorResponse } from "../_shared/utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metric, url, timestamp } = await req.json();
    const supabase = getSupabaseClient();

    // Extract operation name and duration from metric
    const operation = metric.type || 'unknown';
    const duration = Object.values(metric).reduce((a: number, b: any) => {
      if (typeof b === 'number') return a + b;
      return a;
    }, 0) as number;

    await supabase
      .from('performance_metrics')
      .insert({
        operation,
        duration_ms: duration,
        metadata: {
          metric,
          url,
          timestamp,
        },
        tenant_id: null, // Can be extracted from URL if needed
      });

    return successResponse({ success: true });
  } catch (error) {
    console.error('Error logging performance:', error);
    return errorResponse('Failed to log performance', 500);
  }
});

