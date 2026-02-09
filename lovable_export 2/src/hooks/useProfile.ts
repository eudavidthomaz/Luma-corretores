import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";

type ProfileUpdate = TablesUpdate<"profiles">;

// Slug validation regex: lowercase letters, numbers, and hyphens only
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSlugFormat(slug: string): { valid: boolean; error?: string } {
  if (!slug) return { valid: false, error: "O slug é obrigatório" };
  if (slug.length < 3) return { valid: false, error: "Mínimo 3 caracteres" };
  if (slug.length > 50) return { valid: false, error: "Máximo 50 caracteres" };
  if (slug.startsWith("-") || slug.endsWith("-")) {
    return { valid: false, error: "Não pode começar ou terminar com hífen" };
  }
  if (slug.includes("--")) {
    return { valid: false, error: "Não pode ter hífens consecutivos" };
  }
  if (!SLUG_REGEX.test(slug)) {
    return { valid: false, error: "Apenas letras minúsculas, números e hífens" };
  }
  return { valid: true };
}

export function useCheckSlugAvailability() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSlug = useCallback(async (slug: string) => {
    if (!user) return;

    const formatValidation = validateSlugFormat(slug);
    if (!formatValidation.valid) {
      setIsAvailable(false);
      setError(formatValidation.error || null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", slug)
        .neq("id", user.id)
        .maybeSingle();

      if (queryError) throw queryError;

      const available = !data;
      setIsAvailable(available);
      if (!available) {
        setError("Este slug já está em uso");
      }
    } catch {
      setError("Erro ao verificar disponibilidade");
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  const reset = useCallback(() => {
    setIsAvailable(null);
    setError(null);
    setIsChecking(false);
  }, []);

  return { checkSlug, isChecking, isAvailable, error, reset };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();
  
  return useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
