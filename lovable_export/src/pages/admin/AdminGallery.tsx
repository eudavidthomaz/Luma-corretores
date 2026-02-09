import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGalleries } from "@/hooks/useGalleries";
import { useGalleryQuotas } from "@/hooks/useGalleryQuotas";
import { useGalleryMetrics } from "@/hooks/useGalleryMetrics";
import { useGalleryStatusBreakdown } from "@/hooks/useGalleryStatusBreakdown";
import { useFilteredGalleries, GalleryFilters, defaultGalleryFilters } from "@/hooks/useFilteredGalleries";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradeModal } from "@/components/admin/UpgradeModal";
import {
  GalleryHeader,
  GalleryQuotaCard,
  GalleryMetricsCard,
  GalleryStatusPipeline,
  GallerySmartFilter,
  GalleryGrid,
  GalleryEmptyState,
  GalleryListSkeleton,
} from "@/components/admin/gallery";

export default function AdminGallery() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: galleries, isLoading } = useGalleries();
  const quotas = useGalleryQuotas();
  const upgradeModal = useUpgradeModal();

  // Filters state
  const [filters, setFilters] = useState<GalleryFilters>(defaultGalleryFilters);

  // Derived data
  const filteredGalleries = useFilteredGalleries(galleries, filters);
  const metrics = useGalleryMetrics(galleries);
  const statusBreakdown = useGalleryStatusBreakdown(galleries);

  // Handlers
  const handleNewGallery = () => {
    if (!quotas.hasGalleryAccess) {
      upgradeModal.open({
        feature: "gallery",
        requiredPlan: "pro",
      });
      return;
    }
    if (!quotas.canCreateGallery) {
      upgradeModal.open({
        feature: "storage",
        requiredPlan: "ultra",
        customTitle: "Limite de Vitrines Atingido",
        customDescription: `Você atingiu o limite de ${quotas.galleriesLimit} vitrines do seu plano`,
      });
      return;
    }
    navigate("/admin/gallery/new");
  };

  const handleUpgrade = () => {
    upgradeModal.open({
      feature: "storage",
      requiredPlan: "ultra",
    });
  };

  // Calculate active galleries (not draft, not expired)
  const activeGalleries = statusBreakdown.active + statusBreakdown.expiringSoon;

  return (
    <div className="space-y-4">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Header: Full Width */}
        <div className="lg:col-span-4">
          <GalleryHeader
            totalGalleries={galleries?.length || 0}
            activeGalleries={activeGalleries}
            onNewGallery={handleNewGallery}
            canCreate={quotas.canCreateGallery}
            hasAccess={quotas.hasGalleryAccess}
          />
        </div>

        {/* Quota Card: 1 Column */}
        <div className="lg:col-span-1">
          <GalleryQuotaCard
            galleriesUsed={quotas.galleriesUsed}
            galleriesLimit={quotas.galleriesLimit}
            storageUsed={quotas.storageUsed}
            storageLimit={quotas.storageLimit}
            plan={quotas.plan}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Metrics Card: 3 Columns */}
        <div className="lg:col-span-3">
          <GalleryMetricsCard {...metrics} />
        </div>

        {/* Status Pipeline: Full Width */}
        <div className="lg:col-span-4">
          <GalleryStatusPipeline
            {...statusBreakdown}
            activeFilter={filters.status}
            onStatusClick={(status) => setFilters({ ...filters, status })}
          />
        </div>

        {/* Smart Filter: Full Width */}
        <div className="lg:col-span-4">
          <GallerySmartFilter
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={filteredGalleries.length}
            totalGalleries={galleries?.length || 0}
          />
        </div>

        {/* Gallery Grid: Full Width */}
        <div className="lg:col-span-4">
          {isLoading ? (
            <GalleryListSkeleton />
          ) : filteredGalleries.length > 0 ? (
            <GalleryGrid
              galleries={filteredGalleries}
              onGalleryClick={(g) => navigate(`/admin/gallery/${g.id}`)}
            />
          ) : galleries && galleries.length > 0 ? (
            <div className="glass rounded-2xl p-12 border border-luma-glass-border text-center">
              <p className="text-muted-foreground">
                Nenhuma galeria encontrada com esses filtros
              </p>
            </div>
          ) : (
            <GalleryEmptyState
              onCreateClick={handleNewGallery}
              hasAccess={quotas.hasGalleryAccess}
            />
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModal.isOpen}
        onOpenChange={upgradeModal.setOpen}
        feature={upgradeModal.feature}
        requiredPlan={upgradeModal.requiredPlan}
        customTitle={upgradeModal.customTitle}
        customDescription={upgradeModal.customDescription}
        currentPlan={profile?.plan}
      />
    </div>
  );
}
