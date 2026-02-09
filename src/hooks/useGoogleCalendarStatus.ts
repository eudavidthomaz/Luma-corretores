import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface GoogleCalendarStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

const REDIRECT_URI = `${window.location.origin}/admin/settings`;

export function useGoogleCalendarStatus(): GoogleCalendarStatus {
  const { user, profile, refreshProfile } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      if (code && state && user && state === user.id) {
        try {
          setIsLoading(true);
          
          const { data: sessionData } = await supabase.auth.getSession();
          
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-oauth`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionData.session?.access_token}`,
              },
              body: JSON.stringify({
                action: "exchange-code",
                code,
                redirect_uri: REDIRECT_URI,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Falha ao conectar");
          }

          setIsConnected(true);
          await refreshProfile();
          
          toast({
            title: "Google Agenda conectada",
            description: "Sua agenda foi vinculada com sucesso!",
          });

          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error("OAuth callback error:", err);
          setError("Erro ao processar autenticação");
          toast({
            title: "Erro ao conectar",
            description: "Não foi possível conectar sua agenda. Tente novamente.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      handleOAuthCallback();
    }
  }, [user, refreshProfile]);

  // Ref to track if we've already checked status
  const hasCheckedRef = useRef(false);

  const checkStatus = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-oauth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({ action: "check-status" }),
        }
      );

      const data = await response.json();
      setIsConnected(data.connected || false);
      // Removed refreshProfile call to prevent loop
    } catch (err) {
      console.error("Error checking Google Calendar status:", err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Removed profile and refreshProfile from dependencies

  // Reset check flag when user changes
  useEffect(() => {
    hasCheckedRef.current = false;
  }, [user?.id]);

  useEffect(() => {
    // Don't check if we're handling OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    // Only check once per user session
    if (!urlParams.get("code") && !hasCheckedRef.current && user) {
      hasCheckedRef.current = true;
      checkStatus();
    }
  }, [user, checkStatus]);

  const connect = useCallback(async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para conectar sua agenda",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-oauth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "get-auth-url",
            redirect_uri: REDIRECT_URI,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao iniciar conexão");
      }

      // Redirect to Google OAuth
      window.location.href = data.auth_url;
    } catch (err: any) {
      console.error("Error connecting Google Calendar:", err);
      setError(err.message || "Erro ao conectar agenda");
      toast({
        title: "Erro ao conectar",
        description: err.message || "Não foi possível conectar sua agenda do Google",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [user]);

  const disconnect = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-oauth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({ action: "disconnect" }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao desconectar");
      }

      setIsConnected(false);
      await refreshProfile();
      
      toast({
        title: "Agenda desconectada",
        description: "Sua agenda do Google foi desvinculada com sucesso",
      });
    } catch (err: any) {
      console.error("Error disconnecting Google Calendar:", err);
      setError(err.message || "Erro ao desconectar agenda");
      toast({
        title: "Erro",
        description: "Não foi possível desconectar sua agenda",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshProfile]);

  return {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    checkStatus,
  };
}
