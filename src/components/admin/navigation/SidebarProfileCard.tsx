import { Link } from "react-router-dom";
import { Check, Crown, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarQuotaRing } from "./SidebarQuotaRing";
import { getPlanLimit } from "@/lib/planLimits";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface SidebarProfileCardProps {
  profile: Profile | null;
  isRestricted: boolean;
  onSignOut: () => void;
}

export function SidebarProfileCard({
  profile,
  isRestricted,
  onSignOut,
}: SidebarProfileCardProps) {
  const planLimits = getPlanLimit(profile?.plan);

  return (
    <div className="glass rounded-2xl p-4 border border-luma-glass-border space-y-4">
      {/* Profile Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-sm">
          {profile?.business_name?.charAt(0)?.toUpperCase() || "L"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {profile?.business_name || "Meu Estúdio"}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground capitalize">
              Plano {profile?.plan || "Free"}
            </span>
            {!isRestricted && (
              <Check className="h-3 w-3 text-green-500" />
            )}
          </div>
        </div>
      </div>

      {/* Quota Rings - Only show for non-restricted users */}
      {!isRestricted && (
        <div className="flex justify-around py-1">
          <SidebarQuotaRing
            label="Leads"
            current={profile?.leads_used_this_month || 0}
            max={planLimits.leadsLimit}
            color="primary"
          />
          <SidebarQuotaRing
            label="Stories"
            current={0} // Would need actual count from query
            max={planLimits.stories}
            color="violet"
          />
          <SidebarQuotaRing
            label="Galerias"
            current={0} // Would need actual count from query
            max={planLimits.galleries}
            color="cyan"
          />
        </div>
      )}

      {/* Upgrade prompt for restricted users */}
      {isRestricted && (
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground mb-2">
            Faça upgrade para desbloquear recursos
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link to="/admin/subscription" className="flex-1">
          <Button 
            variant={isRestricted ? "gradient" : "outline"} 
            size="sm" 
            className="w-full gap-2"
          >
            {isRestricted ? (
              <>
                <Crown className="h-3.5 w-3.5" />
                Upgrade
              </>
            ) : (
              <>
                <CreditCard className="h-3.5 w-3.5" />
                Assinatura
              </>
            )}
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onSignOut}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
