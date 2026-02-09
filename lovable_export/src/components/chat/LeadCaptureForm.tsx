import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Send, User, Phone, Sparkles } from "lucide-react";

interface LeadCaptureFormProps {
  profileId: string;
  interestCategoryId?: string;
  onSuccess?: () => void;
}

export function LeadCaptureForm({ profileId, interestCategoryId, onSuccess }: LeadCaptureFormProps) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const createLead = useMutation({
    mutationFn: async (lead: TablesInsert<"leads">) => {
      const { data, error } = await supabase
        .from("leads")
        .insert(lead)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Obrigado! Entraremos em contato em breve. ✨");
      setName("");
      setWhatsapp("");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Ops! Algo deu errado. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !whatsapp.trim()) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    createLead.mutate({
      profile_id: profileId,
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      interest_category_id: interestCategoryId,
      status: "novo",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm"
    >
      <div className="glass rounded-2xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Quer saber mais?</h3>
            <p className="text-xs text-muted-foreground">Deixe seu contato que falamos com você!</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs text-muted-foreground">Seu nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Como podemos te chamar?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 h-12"
                autoComplete="name"
                enterKeyHint="next"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp" className="text-xs text-muted-foreground">WhatsApp</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="whatsapp"
                placeholder="(11) 99999-9999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="pl-9 h-12"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="send"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full h-10"
            disabled={createLead.isPending}
          >
            {createLead.isPending ? (
              "Enviando..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Quero saber mais
              </>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
