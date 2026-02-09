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
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId parameter" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch only public-safe profile data including plan
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, business_name, avatar_url, niche, luma_avatar_url, plan")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      console.error("Profile not found:", error);
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check if user's plan has Luma Chat access
    const plansWithLumaAccess = ['trial', 'lite', 'pro', 'ultra', 'enterprise'];
    if (!plansWithLumaAccess.includes(profile.plan)) {
      return new Response(
        JSON.stringify({ enabled: false }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          } 
        }
      );
    }

    // Return minimal data for widget
    return new Response(
      JSON.stringify({
        id: profile.id,
        business_name: profile.business_name,
        avatar_url: profile.avatar_url,
        niche: profile.niche,
        luma_avatar_url: profile.luma_avatar_url,
        enabled: true,
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        } 
      }
    );
  } catch (err) {
    console.error("Widget profile error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
