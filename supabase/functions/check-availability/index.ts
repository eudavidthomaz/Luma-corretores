import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AvailabilityRequest {
  date: string; // YYYY-MM-DD format
  user_id: string;
}

interface BusySlot {
  start: string;
  end: string;
}

interface AvailabilityResponse {
  available: boolean;
  busy_slots: BusySlot[];
  calendar_connected: boolean;
  error?: string;
}

async function refreshAccessToken(
  supabaseAdmin: any,
  userId: string,
  refreshToken: string,
  googleClientId: string,
  googleClientSecret: string
): Promise<string | null> {
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token refresh failed:", await tokenResponse.text());
      return null;
    }

    const tokens = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabaseAdmin
      .from("google_calendar_tokens")
      .update({
        access_token: tokens.access_token,
        token_expires_at: expiresAt,
      })
      .eq("user_id", userId);

    return tokens.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, user_id } = await req.json() as AvailabilityRequest;

    if (!date || !user_id) {
      return new Response(
        JSON.stringify({ 
          available: true, 
          busy_slots: [], 
          calendar_connected: false,
          error: "Missing date or user_id" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking availability for user ${user_id} on ${date}`);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ 
          available: true, 
          busy_slots: [], 
          calendar_connected: false,
          error: "Server configuration error" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get tokens from google_calendar_tokens table
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("google_calendar_tokens")
      .select("access_token, refresh_token, token_expires_at")
      .eq("user_id", user_id)
      .single();

    if (tokenError || !tokenData) {
      console.log("No Google Calendar tokens found for user");
      return new Response(
        JSON.stringify({ 
          available: true, 
          busy_slots: [], 
          calendar_connected: false 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = tokenData.access_token;

    // Check if token is expired
    if (tokenData.token_expires_at) {
      const expiresAt = new Date(tokenData.token_expires_at);
      const now = new Date();
      
      // Refresh if token expires in less than 5 minutes
      if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
        console.log("Token expired or expiring soon, refreshing...");
        
        if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && tokenData.refresh_token) {
          const newToken = await refreshAccessToken(
            supabaseAdmin,
            user_id,
            tokenData.refresh_token,
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET
          );
          
          if (newToken) {
            accessToken = newToken;
          } else {
            // Token refresh failed, user needs to reconnect
            return new Response(
              JSON.stringify({ 
                available: true, 
                busy_slots: [], 
                calendar_connected: true,
                error: "token_expired" 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          console.log("Cannot refresh: missing credentials or refresh token");
          return new Response(
            JSON.stringify({ 
              available: true, 
              busy_slots: [], 
              calendar_connected: true,
              error: "token_expired" 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Parse the date and create time range for the full day
    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    // Call Google Calendar FreeBusy API
    const freeBusyRequest = {
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      items: [{ id: "primary" }],
    };

    console.log("Calling Google Calendar FreeBusy API:", freeBusyRequest);

    const calendarResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/freeBusy",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(freeBusyRequest),
      }
    );

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      console.error("Google Calendar API error:", calendarResponse.status, errorText);
      
      // Token might be expired, try to refresh
      if (calendarResponse.status === 401 && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && tokenData.refresh_token) {
        console.log("Got 401, attempting token refresh...");
        const newToken = await refreshAccessToken(
          supabaseAdmin,
          user_id,
          tokenData.refresh_token,
          GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET
        );
        
        if (newToken) {
          // Retry the request with new token
          const retryResponse = await fetch(
            "https://www.googleapis.com/calendar/v3/freeBusy",
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(freeBusyRequest),
            }
          );
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            const busySlots: BusySlot[] = retryData.calendars?.primary?.busy || [];
            const isAvailable = busySlots.length === 0;
            
            return new Response(
              JSON.stringify({
                available: isAvailable,
                busy_slots: busySlots,
                calendar_connected: true,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        
        return new Response(
          JSON.stringify({ 
            available: true, 
            busy_slots: [], 
            calendar_connected: true,
            error: "token_expired" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          available: true, 
          busy_slots: [], 
          calendar_connected: true,
          error: "calendar_api_error" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const calendarData = await calendarResponse.json();
    console.log("Calendar response:", JSON.stringify(calendarData));

    // Extract busy slots
    const busySlots: BusySlot[] = calendarData.calendars?.primary?.busy || [];
    const isAvailable = busySlots.length === 0;

    console.log(`Date ${date}: ${isAvailable ? "available" : "busy"}, ${busySlots.length} busy slots`);

    const response: AvailabilityResponse = {
      available: isAvailable,
      busy_slots: busySlots,
      calendar_connected: true,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in check-availability:", error);
    return new Response(
      JSON.stringify({ 
        available: true, 
        busy_slots: [], 
        calendar_connected: false,
        error: "internal_error" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
