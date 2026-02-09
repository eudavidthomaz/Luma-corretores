import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Map Stripe product IDs to plan types
const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_TiHM0pg9IVQg08": "lite",
  "prod_TiHMSh3PhEpFWb": "pro",
  "prod_TiHMof5wJOTEc9": "ultra",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header - returning unsubscribed state");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: null,
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      logStep("Auth failed or no email - returning unsubscribed state", { error: userError?.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: null,
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning unsubscribed state");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: null,
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let plan = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      
      // PRIMEIRO: Determinar e atualizar o plano (crítico - antes de qualquer operação que possa falhar)
      const productId = subscription.items?.data?.[0]?.price?.product as string;
      if (productId) {
        plan = PRODUCT_TO_PLAN[productId] || null;
        logStep("Determined plan", { productId, plan });

        // Atualizar perfil com plano E limpar trial_ends_at
        if (plan) {
          const { error: updateError } = await supabaseClient
            .from("profiles")
            .update({ plan, trial_ends_at: null })
            .eq("id", user.id);
          
          if (updateError) {
            logStep("Failed to update profile plan", { error: updateError.message });
          } else {
            logStep("Profile plan updated", { plan });
          }
        }
      } else {
        logStep("Warning: Could not determine product ID from subscription");
      }
      
      // DEPOIS: Processar data de fim (com try-catch para evitar falhas)
      try {
        const endTimestamp = subscription.current_period_end;
        if (endTimestamp && typeof endTimestamp === 'number') {
          subscriptionEnd = new Date(endTimestamp * 1000).toISOString();
        }
      } catch (dateError) {
        logStep("Warning: Could not parse subscription end date", { 
          raw: subscription.current_period_end 
        });
      }
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
        plan 
      });
    } else {
      logStep("No active subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
