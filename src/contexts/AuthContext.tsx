import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { SubscriptionStatus } from "@/lib/stripe";

type Profile = Tables<"profiles">;

// Helper: Deriva o status de assinatura diretamente do profile (SEM Edge Function!)
// Isso elimina ~1,000 chamadas/mês ao check-subscription
function deriveSubscriptionFromProfile(profile: Profile | null): SubscriptionStatus {
  if (!profile) {
    return { subscribed: false, plan: null, subscriptionEnd: null };
  }
  
  const paidPlans = ['lite', 'pro', 'ultra', 'enterprise'];
  const subscribed = paidPlans.includes(profile.plan);
  
  return {
    subscribed,
    plan: profile.plan,
    subscriptionEnd: (profile as Profile & { subscription_ends_at?: string | null }).subscription_ends_at || null,
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  subscription: SubscriptionStatus;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, businessName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    plan: null,
    subscriptionEnd: null,
  });
  
  // Safety valve: prevent multiple rapid calls (throttle 5 seconds)
  const lastCheckRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    setProfile(data);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Stable checkSubscription - no useCallback, uses refs to avoid dependency loops
  const checkSubscription = async () => {
    // Safety valve: prevent calls within 5 seconds of each other
    const now = Date.now();
    if (now - lastCheckRef.current < 5000) {
      console.log("[AuthContext] Throttled: subscription check skipped (< 5s)");
      return;
    }
    
    // Prevent concurrent executions
    if (isCheckingRef.current) {
      console.log("[AuthContext] Already checking subscription, skipping...");
      return;
    }
    
    // Get current session from Supabase directly (avoids stale closure)
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setSubscription({ subscribed: false, plan: null, subscriptionEnd: null });
      return;
    }

    isCheckingRef.current = true;
    lastCheckRef.current = now;

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('auth') || errorMsg.includes('session') || errorMsg.includes('401')) {
          console.log("[AuthContext] Edge function auth error, signing out...");
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
          setSubscription({ subscribed: false, plan: null, subscriptionEnd: null });
        }
        return;
      }

      if (data) {
        setSubscription({
          subscribed: data.subscribed,
          plan: data.plan,
          subscriptionEnd: data.subscription_end,
        });

        // Refresh profile if subscribed
        if (data.subscribed && sessionData.session.user) {
          await fetchProfile(sessionData.session.user.id);
        }
      }
    } catch {
      // Silent fail - subscription check is non-critical
    } finally {
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(async () => {
            // Check if profile exists
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("id, google_calendar_connected")
              .eq("id", session.user.id)
              .maybeSingle();
            
            // Get provider info - works for Google, Apple, and other OAuth providers
            const provider = session.user.app_metadata?.provider;
            const isOAuthUser = ['google', 'apple'].includes(provider);
            const isGoogleUser = provider === 'google';
            
            // If no profile exists (new OAuth user), create one with plan='pending'
            if (!existingProfile && isOAuthUser) {
              await supabase.from("profiles").insert({
                id: session.user.id,
                business_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Meu Estúdio',
                plan: 'pending', // Forces user to subscribe before accessing the system
                google_calendar_connected: isGoogleUser,
                google_calendar_connected_at: isGoogleUser ? new Date().toISOString() : null,
              });
            } else if (isGoogleUser && existingProfile && !existingProfile.google_calendar_connected) {
              // Update existing profile to mark Google calendar as connected
              await supabase.from("profiles").update({
                google_calendar_connected: true,
                google_calendar_connected_at: new Date().toISOString(),
              }).eq("id", session.user.id);
            }
            
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setSubscription({ subscribed: false, plan: null, subscriptionEnd: null });
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  // OTIMIZAÇÃO: Deriva subscription do profile (sem chamar Edge Function)
  // O webhook do Stripe atualiza o profile, então já temos os dados localmente
  useEffect(() => {
    if (profile) {
      const derived = deriveSubscriptionFromProfile(profile);
      setSubscription(derived);
    } else if (!session) {
      setSubscription({ subscribed: false, plan: null, subscriptionEnd: null });
    }
  }, [profile, session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, businessName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          business_name: businessName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription({ subscribed: false, plan: null, subscriptionEnd: null });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        subscription,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        checkSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
