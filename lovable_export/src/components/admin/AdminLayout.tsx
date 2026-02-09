import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileNav } from "@/components/admin/MobileNav";
import { OfflineIndicator } from "@/components/admin/OfflineIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useLeadNotifications } from "@/hooks/useLeadNotifications";
import { useLeadsBadge } from "@/hooks/useAppBadge";
import { useLeads } from "@/hooks/useLeads";
import { Loader2 } from "lucide-react";

// Planos que TÊM acesso ao sistema
const PAID_PLANS = ['lite', 'pro', 'ultra', 'enterprise'];

export function AdminLayout() {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Real-time lead notifications
  useLeadNotifications(user?.id);
  
  // Get leads to count unread (status = "novo")
  const { data: leads } = useLeads(user?.id);
  const unreadCount = leads?.filter(l => l.status === "novo").length || 0;
  
  // Sync badge with unread count
  useLeadsBadge(unreadCount);

  // Verificar se usuário tem acesso pago
  const hasPaidAccess = profile?.plan && PAID_PLANS.includes(profile.plan);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // Hard gating: redirecionar não-pagantes para subscription
  useEffect(() => {
    if (!isLoading && profile) {
      const currentPath = location.pathname;
      
      // Única rota permitida para não-pagantes
      if (!hasPaidAccess && currentPath !== '/admin/subscription') {
        navigate('/admin/subscription');
      }
    }
  }, [profile, isLoading, location.pathname, hasPaidAccess, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Bloquear renderização enquanto verifica (evita flash do dashboard)
  if (profile && !hasPaidAccess && location.pathname !== '/admin/subscription') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Ambient background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-secondary/3 rounded-full blur-3xl" />
      </div>

      <AdminSidebar />
      <MobileNav />
      
      <main className="lg:pl-64 min-h-screen">
        <div className="p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
