import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStories } from "@/hooks/useStories";
import { useCategories } from "@/hooks/useCategories";
import { useStoriesQuotas } from "@/hooks/useStoriesQuotas";
import { useStoriesMetrics } from "@/hooks/useStoriesMetrics";
import { useStoriesStatusBreakdown } from "@/hooks/useStoriesStatusBreakdown";
import { useFilteredStories, defaultStoriesFilters, StoriesFilters } from "@/hooks/useFilteredStories";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { UpgradeModal } from "@/components/admin/UpgradeModal";
import {
  StoriesHeader,
  StoriesQuotaCard,
  StoriesMetricsCard,
  StoriesStatusPipeline,
  StoriesSmartFilter,
  StoriesGrid,
  StoriesEmptyState,
  StoriesListSkeleton,
  StoryStatusFilter,
} from "@/components/admin/stories";

export default function AdminStories() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: stories, isLoading } = useStories(user?.id);
  const { data: categories } = useCategories();
  const quotas = useStoriesQuotas();
  const upgradeModal = useUpgradeModal();

  // Derived data
  const metrics = useStoriesMetrics(stories);
  const statusBreakdown = useStoriesStatusBreakdown(stories);

  // Filters
  const [filters, setFilters] = useState<StoriesFilters>(defaultStoriesFilters);
  const [pipelineFilter, setPipelineFilter] = useState<StoryStatusFilter>("all");

  // Apply pipeline filter to stories filters
  const effectiveFilters: StoriesFilters = {
    ...filters,
    status: pipelineFilter === "carousel"
      ? "published"
      : pipelineFilter === "all"
        ? filters.status
        : pipelineFilter,
  };

  const filteredStories = useFilteredStories(stories, effectiveFilters);

  // Further filter for carousel if needed
  const displayedStories = pipelineFilter === "carousel"
    ? filteredStories.filter((s) => s.show_in_carousel)
    : filteredStories;

  const handleNewStory = () => {
    if (!quotas.hasStoriesAccess) {
      upgradeModal.open({ feature: "stories", requiredPlan: "pro" });
      return;
    }
    if (!quotas.canCreate) {
      upgradeModal.open({
        feature: "stories",
        requiredPlan: "ultra",
        customTitle: "Limite de Imóveis Atingido",
        customDescription: `Você atingiu o limite de ${quotas.storiesLimit} imóveis do seu plano`,
      });
      return;
    }
    navigate("/admin/stories/new");
  };

  const handlePipelineClick = (status: StoryStatusFilter) => {
    setPipelineFilter(status);
    if (status !== "all") {
      setFilters((f) => ({ ...f, status: "all" }));
    }
  };

  if (isLoading) {
    return <StoriesListSkeleton />;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <StoriesHeader
        totalStories={stories?.length || 0}
        publishedStories={metrics.publishedCount}
        onNewStory={handleNewStory}
        canCreate={quotas.canCreate}
        hasAccess={quotas.hasStoriesAccess}
      />

      {/* Bento Grid: Quota + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <StoriesQuotaCard
            storiesUsed={quotas.storiesUsed}
            storiesLimit={quotas.storiesLimit}
            chaptersPerStory={quotas.photosPerStory}
            canUploadVideo={quotas.canUploadVideo}
            plan={quotas.plan}
            onUpgrade={() => upgradeModal.open({ feature: "stories", requiredPlan: "ultra" })}
          />
        </div>
        <div className="lg:col-span-3">
          <StoriesMetricsCard
            totalViews={metrics.totalViews}
            publishedCount={metrics.publishedCount}
            draftCount={metrics.draftCount}
            inCarouselCount={metrics.inCarouselCount}
          />
        </div>
      </div>

      {/* Status Pipeline */}
      <StoriesStatusPipeline
        draft={statusBreakdown.draft}
        published={statusBreakdown.published}
        inCarousel={statusBreakdown.inCarousel}
        activeFilter={pipelineFilter}
        onStatusClick={handlePipelineClick}
      />

      {/* Smart Filter */}
      <StoriesSmartFilter
        filters={filters}
        onFiltersChange={setFilters}
        totalResults={displayedStories.length}
        categories={categories}
      />

      {/* Stories Grid */}
      {displayedStories.length > 0 ? (
        <StoriesGrid
          stories={displayedStories}
          categories={categories}
          onStoryClick={(story) => navigate(`/admin/stories/${story.id}`)}
        />
      ) : stories && stories.length > 0 ? (
        <div className="glass rounded-2xl p-12 border border-luma-glass-border text-center">
          <p className="text-muted-foreground">
            Nenhum imóvel encontrado com esses filtros
          </p>
        </div>
      ) : (
        <StoriesEmptyState onCreateClick={handleNewStory} canCreate={quotas.canCreate} />
      )}

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
