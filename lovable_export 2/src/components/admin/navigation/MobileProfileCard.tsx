import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MobileQuotaBar } from "./MobileQuotaBar";
import { getPlanLimit } from "@/lib/planLimits";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface MobileProfileCardProps {
  profile: Profile | null;
  isRestricted: boolean;
}

export function MobileProfileCard({ profile, isRestricted }: MobileProfileCardProps) {
  const planLimits = getPlanLimit(profile?.plan);

  return (
    <div className="glass rounded-2xl p-5 border border-luma-glass-border">
      {/* Avatar & Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {profile?.business_name?.charAt(0)?.toUpperCase() || "L"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground truncate">
            {profile?.business_name || "Meu Estúdio"}
          </h3>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="capitalize bg-primary/10 text-primary border-primary/20"
            >
              {profile?.plan || "Free"}
            </Badge>
            {!isRestricted && <Check className="h-4 w-4 text-green-500" />}
          </div>
        </div>
      </div>

      {/* Quota Bars - Only for non-restricted users */}
      {!isRestricted && (
        <div className="space-y-3">
          <MobileQuotaBar
            label="Leads"
            current={profile?.leads_used_this_month || 0}
            max={planLimits.leadsLimit}
            color="primary"
          />
          <MobileQuotaBar
            label="Histórias"
            current={0} // Would need actual count
            max={planLimits.stories}
            color="violet"
          />
          <MobileQuotaBar
            label="Galerias"
            current={0} // Would need actual count
            max={planLimits.galleries}
            color="cyan"
          />
        </div>
      )}

      {/* Upgrade prompt for restricted */}
      {isRestricted && (
        <p className="text-sm text-muted-foreground text-center">
          Faça upgrade para desbloquear todos os recursos
        </p>
      )}
    </div>
  );
}
