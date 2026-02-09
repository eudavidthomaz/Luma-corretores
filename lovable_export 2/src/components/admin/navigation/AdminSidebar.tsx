import { LayoutDashboard, BookOpen, FolderOpen, FileText, Users, Globe, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getTrialDaysRemaining } from "@/lib/planLimits";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNavSection } from "./SidebarNavSection";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarProfileCard } from "./SidebarProfileCard";
import { SidebarFooter } from "./SidebarFooter";

export function AdminSidebar() {
  const { profile, signOut } = useAuth();

  // Check plan access
  const trialDaysRemaining = getTrialDaysRemaining(profile?.trial_ends_at);
  const isFreeUser = profile?.plan === 'free';
  const isTrialExpired = profile?.plan === 'trial' &&
    (trialDaysRemaining === null || trialDaysRemaining <= 0);
  const isRestricted = isFreeUser || isTrialExpired;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-luma-glass-border z-40 hidden lg:flex flex-col">
      {/* Header */}
      <SidebarHeader />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {/* Principal */}
        <SidebarNavSection>
          <SidebarNavItem
            to="/admin"
            icon={LayoutDashboard}
            label="Dashboard"
            end
            isLocked={isRestricted}
          />
        </SidebarNavSection>

        {/* Conteúdo */}
        <SidebarNavSection title="Conteúdo">
          <SidebarNavItem
            to="/admin/stories"
            icon={BookOpen}
            label="Imóveis"
            isLocked={isRestricted}
          />
          <SidebarNavItem
            to="/admin/gallery"
            icon={FolderOpen}
            label="Vitrines"
            isLocked={isRestricted}
          />
          <SidebarNavItem
            to="/admin/proposals"
            icon={FileText}
            label="Propostas"
            isLocked={isRestricted}
          />
        </SidebarNavSection>

        {/* CRM */}
        <SidebarNavSection title="CRM">
          <SidebarNavItem
            to="/admin/leads"
            icon={Users}
            label="Leads"
            isLocked={isRestricted}
          />
        </SidebarNavSection>

        {/* Configuração */}
        <SidebarNavSection title="Configuração">
          <SidebarNavItem
            to="/admin/minisite"
            icon={Globe}
            label="Mini-Site"
          />
          <SidebarNavItem
            to="/admin/settings"
            icon={Sparkles}
            label="Luma IA"
            isLocked={isRestricted}
          />
        </SidebarNavSection>
      </div>

      {/* Footer */}
      <div className="p-4 space-y-4">
        <SidebarProfileCard
          profile={profile}
          isRestricted={isRestricted}
          onSignOut={handleSignOut}
        />
        <SidebarFooter />
      </div>
    </aside>
  );
}
