import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenRequest {
  code: string;
  redirect_uri: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    if (!googleClientId || !googleClientSecret) {
      throw new Error("Missing Google OAuth configuration. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets.");
    }

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, redirect_uri, code } = body;

    if (action === "get-auth-url") {
      // Generate Google OAuth URL
      const scopes = [
        "https://www.googleapis.com/auth/calendar.events.readonly",
        "https://www.googleapis.com/auth/calendar.readonly"
      ].join(" ");

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", googleClientId);
      authUrl.searchParams.set("redirect_uri", redirect_uri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", scopes);
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
      authUrl.searchParams.set("state", user.id);

      return new Response(
        JSON.stringify({ auth_url: authUrl.toString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "exchange-code") {
      // Exchange authorization code for tokens

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: googleClientId,
          client_secret: googleClientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Token exchange error:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to exchange code for tokens" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokens: TokenResponse = await tokenResponse.json();
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

      // Store tokens in database
      const { error: upsertError } = await supabaseAdmin
        .from("google_calendar_tokens")
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
        }, { onConflict: "user_id" });

      if (upsertError) {
        console.error("Error storing tokens:", upsertError);
        return new Response(
          JSON.stringify({ error: "Failed to store tokens" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update profile
      await supabaseAdmin
        .from("profiles")
        .update({
          google_calendar_connected: true,
          google_calendar_connected_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "disconnect") {
      // Remove tokens from database
      const { error: deleteError } = await supabaseAdmin
        .from("google_calendar_tokens")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error deleting tokens:", deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to disconnect" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update profile
      await supabaseAdmin
        .from("profiles")
        .update({
          google_calendar_connected: false,
          google_calendar_connected_at: null,
        })
        .eq("id", user.id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "check-status") {
      // Check if user has valid tokens
      const { data: tokenData } = await supabaseAdmin
        .from("google_calendar_tokens")
        .select("token_expires_at")
        .eq("user_id", user.id)
        .single();

      return new Response(
        JSON.stringify({ 
          connected: !!tokenData,
          expires_at: tokenData?.token_expires_at 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "refresh-token") {
      // Get current refresh token
      const { data: tokenData } = await supabaseAdmin
        .from("google_calendar_tokens")
        .select("refresh_token")
        .eq("user_id", user.id)
        .single();

      if (!tokenData?.refresh_token) {
        return new Response(
          JSON.stringify({ error: "No refresh token available" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: googleClientId,
          client_secret: googleClientSecret,
          refresh_token: tokenData.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (!tokenResponse.ok) {
        // Token refresh failed, disconnect
        await supabaseAdmin
          .from("google_calendar_tokens")
          .delete()
          .eq("user_id", user.id);

        await supabaseAdmin
          .from("profiles")
          .update({
            google_calendar_connected: false,
            google_calendar_connected_at: null,
          })
          .eq("id", user.id);

        return new Response(
          JSON.stringify({ error: "Token refresh failed, please reconnect" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokens: TokenResponse = await tokenResponse.json();
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

      await supabaseAdmin
        .from("google_calendar_tokens")
        .update({
          access_token: tokens.access_token,
          token_expires_at: expiresAt,
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ success: true, access_token: tokens.access_token }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in google-calendar-oauth:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
