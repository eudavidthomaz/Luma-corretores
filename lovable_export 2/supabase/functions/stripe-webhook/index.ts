import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Mapeamento de Product ID → Plano
const PRODUCT_TO_PLAN: Record<string, string> = {
  "prod_TiHM0pg9IVQg08": "lite",
  "prod_TiHMSh3PhEpFWb": "pro",
  "prod_TiHMof5wJOTEc9": "ultra",
};

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  // Verificar assinatura do webhook (segurança)
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!signature || !webhookSecret) {
    logStep("Missing signature or webhook secret", { 
      hasSignature: !!signature, 
      hasSecret: !!webhookSecret 
    });
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  const body = await req.text();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("Webhook signature verification failed", { error: errorMessage });
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  logStep("Webhook received", { type: event.type, id: event.id });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Processar eventos de assinatura
  if (event.type.startsWith("customer.subscription")) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    logStep("Processing subscription event", { 
      subscriptionId: subscription.id, 
      customerId, 
      status: subscription.status 
    });
    
    // Buscar email do customer
    let customerEmail: string | null = null;
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted) {
        customerEmail = (customer as Stripe.Customer).email;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Failed to retrieve customer", { error: errorMessage });
    }
    
    if (!customerEmail) {
      logStep("Customer has no email", { customerId });
      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found customer email", { email: customerEmail });

    // Buscar usuário pelo email no Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.listUsers();
    
    if (authError) {
      logStep("Failed to list users", { error: authError.message });
      return new Response(JSON.stringify({ received: true, error: "Failed to list users" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const user = authData.users.find(u => u.email?.toLowerCase() === customerEmail?.toLowerCase());
    
    if (!user) {
      logStep("User not found for email", { email: customerEmail });
      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found user", { userId: user.id, email: user.email });

    // Processar eventos específicos
    if (event.type === "customer.subscription.created" || 
        event.type === "customer.subscription.updated") {
      
      if (subscription.status === "active" || subscription.status === "trialing") {
        const productId = subscription.items?.data?.[0]?.price?.product as string;
        const plan = productId ? PRODUCT_TO_PLAN[productId] : null;
        
        logStep("Determined plan from subscription", { productId, plan });
        
        if (plan) {
          // Salvar subscription_ends_at junto com o plano para otimização de custos
          const subscriptionEndsAt = new Date(subscription.current_period_end * 1000).toISOString();
          
          const { error: updateError } = await supabaseClient
            .from("profiles")
            .update({ 
              plan, 
              trial_ends_at: null,
              subscription_ends_at: subscriptionEndsAt
            })
            .eq("id", user.id);
          
          if (updateError) {
            logStep("Failed to update plan", { userId: user.id, error: updateError.message });
          } else {
            logStep("Plan updated successfully", { userId: user.id, plan });
          }
        } else {
          logStep("Could not determine plan from product", { productId });
        }
      } else {
        logStep("Subscription not active", { status: subscription.status });
      }
    }

  if (event.type === "customer.subscription.deleted") {
      // Quando assinatura é cancelada, reverter para FREE e limpar subscription_ends_at
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ 
          plan: "free",
          subscription_ends_at: null
        })
        .eq("id", user.id);
      
      if (updateError) {
        logStep("Failed to revert to free", { userId: user.id, error: updateError.message });
      } else {
        logStep("Reverted to free successfully", { userId: user.id });
      }
    }
  }

  // Processar eventos de invoice (para logs adicionais)
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    logStep("Payment succeeded", { 
      invoiceId: invoice.id, 
      customerId: invoice.customer,
      amount: invoice.amount_paid 
    });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    logStep("Payment failed", { 
      invoiceId: invoice.id, 
      customerId: invoice.customer,
      amount: invoice.amount_due 
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
