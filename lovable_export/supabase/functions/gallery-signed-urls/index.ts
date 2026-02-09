import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paths } = await req.json();

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      console.error("Invalid paths:", paths);
      return new Response(
        JSON.stringify({ error: "paths array is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Limit to prevent abuse
    if (paths.length > 100) {
      return new Response(
        JSON.stringify({ error: "Maximum 100 paths allowed per request" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Generating signed URLs for ${paths.length} files`);

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.storage
      .from("gallery-photos")
      .createSignedUrls(paths, 3600); // 1 hour validity

    if (error) {
      console.error("Storage error:", error);
      throw error;
    }

    console.log(`Successfully generated ${data?.length || 0} signed URLs`);

    return new Response(
      JSON.stringify({ urls: data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error generating signed URLs:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
