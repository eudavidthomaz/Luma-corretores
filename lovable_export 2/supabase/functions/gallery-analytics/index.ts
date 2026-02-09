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
    const { galleryId, action } = await req.json();

    if (!galleryId || !action) {
      return new Response(
        JSON.stringify({ error: "galleryId and action are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["view", "download"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "action must be 'view' or 'download'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current gallery to verify it exists and is active
    const { data: gallery, error: fetchError } = await supabase
      .from("galleries")
      .select("id, status, expires_at, views_count, downloads_count")
      .eq("id", galleryId)
      .single();

    if (fetchError || !gallery) {
      console.error("Gallery not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Gallery not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if gallery is expired
    if (new Date(gallery.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Gallery has expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment the appropriate counter
    const updateField = action === "view" ? "views_count" : "downloads_count";
    const currentValue = action === "view" ? gallery.views_count : gallery.downloads_count;

    const { error: updateError } = await supabase
      .from("galleries")
      .update({ [updateField]: (currentValue || 0) + 1 })
      .eq("id", galleryId);

    if (updateError) {
      console.error("Failed to update counter:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update analytics" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Gallery ${galleryId}: ${action} count incremented to ${(currentValue || 0) + 1}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        action,
        newCount: (currentValue || 0) + 1 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in gallery-analytics:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
