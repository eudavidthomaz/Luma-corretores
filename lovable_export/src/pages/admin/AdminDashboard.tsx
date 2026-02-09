import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DashboardHeader,
  QuickActionsGrid,
  RecentProposalsCard,
  HotLeadsCard,
  CompactMetricsCard,
  PlanUsageCard,
} from "@/components/admin/dashboard";

export default function AdminDashboard() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Header: Full width */}
      <div className="lg:col-span-4">
        <DashboardHeader businessName={profile.business_name} />
      </div>

      {/* Quick Actions: 4 colunas */}
      <div className="lg:col-span-4">
        <QuickActionsGrid />
      </div>

      {/* Propostas: 2 colunas */}
      <div className="lg:col-span-2">
        <RecentProposalsCard />
      </div>

      {/* Leads Quentes: 2 colunas */}
      <div className="lg:col-span-2">
        <HotLeadsCard />
      </div>

      {/* Métricas: 2 colunas */}
      <div className="lg:col-span-2">
        <CompactMetricsCard />
      </div>

      {/* Uso do Plano: 2 colunas */}
      <div className="lg:col-span-2">
        <PlanUsageCard />
      </div>
    </div>
  );
}
