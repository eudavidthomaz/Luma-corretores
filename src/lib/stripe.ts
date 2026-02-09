// Stripe plan configuration mapping price IDs to plan types
export const STRIPE_PLANS = {
  lite: {
    priceId: "price_1SkqnhLRK47RuukgWFK2Ibd1",
    productId: "prod_TiHM0pg9IVQg08",
  },
  pro: {
    priceId: "price_1SkqntLRK47RuukgVUGN7QCW",
    productId: "prod_TiHMSh3PhEpFWb",
  },
  ultra: {
    priceId: "price_1Skqo3LRK47RuukgOFAlB85o",
    productId: "prod_TiHMof5wJOTEc9",
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;

export interface SubscriptionStatus {
  subscribed: boolean;
  plan: string | null;
  subscriptionEnd: string | null;
}
