import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEnhanceContract() {
  return useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase.functions.invoke('enhance-contract', {
        body: { content }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data.enhanced_content as string;
    }
  });
}
