import { motion } from "framer-motion";
import { Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProposalExpiredStateProps {
  title: string;
  profile: {
    business_name: string;
    avatar_url: string | null;
    minisite_avatar_url: string | null;
    whatsapp_number: string | null;
  };
}

export function ProposalExpiredState({ title, profile }: ProposalExpiredStateProps) {
  const avatarUrl = profile.minisite_avatar_url || profile.avatar_url;
  
  const handleContact = () => {
    if (profile.whatsapp_number) {
      const message = encodeURIComponent(`Olá! Vi que a proposta "${title}" expirou. Gostaria de saber se ainda está disponível.`);
      window.open(`https://wa.me/${profile.whatsapp_number.replace(/\D/g, "")}?text=${message}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {avatarUrl && (
          <img 
            src={avatarUrl} 
            alt={profile.business_name}
            className="h-20 w-20 rounded-full object-cover mx-auto mb-6 border-2 border-gallery-border"
          />
        )}
        
        <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>
        
        <h1 className="text-2xl font-semibold text-editorial-display text-gallery-text mb-2">
          Proposta Expirada
        </h1>
        
        <p className="text-gallery-text-muted mb-6">
          A proposta <strong>{title}</strong> não está mais disponível.
          Entre em contato para mais informações.
        </p>
        
        {profile.whatsapp_number && (
          <Button onClick={handleContact} className="gallery-btn-primary">
            <Phone className="h-4 w-4 mr-2" />
            Entrar em Contato
          </Button>
        )}
      </motion.div>
    </div>
  );
}
