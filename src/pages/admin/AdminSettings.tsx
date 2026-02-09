import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useUploadFile } from "@/hooks/useStorage";
import { useGoogleCalendarStatus } from "@/hooks/useGoogleCalendarStatus";
import { toast } from "@/hooks/use-toast";
import { PLAN_DETAILS, PlanType } from "@/lib/planLimits";
import {
  SettingsHeader,
  IdentityContainer,
  TechnicalContainer,
  IntelligenceContainer,
} from "@/components/admin/settings";
import { PricingPackagesData } from "@/components/admin/settings/IntelligenceContainer";

export default function AdminSettings() {
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile();
  const uploadFile = useUploadFile();
  
  // Google Calendar connection status
  const googleCalendar = useGoogleCalendarStatus();

  const extendedProfile = profile as typeof profile & {
    slug?: string;
    ai_context?: string;
    show_category_chips?: boolean;
    show_story_carousel?: boolean;
    luma_initial_message?: string;
    luma_avatar_url?: string;
    luma_status?: string;
    pricing_packages?: PricingPackagesData;
    custom_domain?: string;
  };

  const defaultPricingPackages: PricingPackagesData = {
    packages: [],
    allow_luma_share: false,
  };
  
  // Form state
  const [businessName, setBusinessName] = useState(profile?.business_name || "");
  const [niche, setNiche] = useState(profile?.niche || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsapp_number || "");
  const [aiContext, setAiContext] = useState(extendedProfile?.ai_context || "");
  const [showCategoryChips, setShowCategoryChips] = useState(extendedProfile?.show_category_chips !== false);
  const [showStoryCarousel, setShowStoryCarousel] = useState(extendedProfile?.show_story_carousel !== false);
  const [pricingPackages, setPricingPackages] = useState<PricingPackagesData>(
    extendedProfile?.pricing_packages || defaultPricingPackages
  );
  const [lumaInitialMessage, setLumaInitialMessage] = useState(extendedProfile?.luma_initial_message || "");
  const [lumaStatus, setLumaStatus] = useState(extendedProfile?.luma_status || "Online");
  const [customDomain, setCustomDomain] = useState(extendedProfile?.custom_domain || "");
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingLumaAvatar, setIsUploadingLumaAvatar] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync local state with profile ONLY on first load
  useEffect(() => {
    if (profile && !isInitialized) {
      setBusinessName(profile.business_name || "");
      setNiche(profile.niche || "");
      setBio(profile.bio || "");
      setWhatsappNumber(profile.whatsapp_number || "");
      setAiContext(extendedProfile?.ai_context || "");
      setShowCategoryChips(extendedProfile?.show_category_chips !== false);
      setShowStoryCarousel(extendedProfile?.show_story_carousel !== false);
      setLumaInitialMessage(extendedProfile?.luma_initial_message || "");
      setLumaStatus(extendedProfile?.luma_status || "Online");
      setPricingPackages(extendedProfile?.pricing_packages || defaultPricingPackages);
      setCustomDomain(extendedProfile?.custom_domain || "");
      setIsInitialized(true);
    }
  }, [profile, isInitialized]);

  // Plan info
  const currentPlan = (profile?.plan || "trial") as PlanType;
  const planInfo = PLAN_DETAILS[currentPlan as keyof typeof PLAN_DETAILS] || PLAN_DETAILS.trial;

  // Avatar handlers
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploadingAvatar(true);
    try {
      const path = `${user.id}/avatar/${Date.now()}-${file.name}`;
      const avatarUrl = await uploadFile.mutateAsync({ file, path });
      await updateProfile.mutateAsync({ avatar_url: avatarUrl });
      await refreshProfile();
      toast({ title: "Avatar atualizado!" });
    } catch {
      toast({ title: "Erro ao atualizar avatar", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLumaAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploadingLumaAvatar(true);
    try {
      const path = `${user.id}/luma-avatar/${Date.now()}-${file.name}`;
      const avatarUrl = await uploadFile.mutateAsync({ file, path });
      await updateProfile.mutateAsync({ luma_avatar_url: avatarUrl } as any);
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
      toast({ title: "Avatar da Luma atualizado!" });
    } catch {
      toast({ title: "Erro ao atualizar avatar", variant: "destructive" });
    } finally {
      setIsUploadingLumaAvatar(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        business_name: businessName,
        niche,
        bio,
        whatsapp_number: whatsappNumber || null,
        ai_context: aiContext || null,
        show_category_chips: showCategoryChips,
        show_story_carousel: showStoryCarousel,
        luma_initial_message: lumaInitialMessage || null,
        luma_status: lumaStatus || "Online",
        pricing_packages: pricingPackages,
      } as any);
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
      queryClient.invalidateQueries({ queryKey: ["carousel-stories"] });
      toast({ title: "Configurações salvas!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDomain = async (domain: string) => {
    try {
      const normalizedDomain = domain
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '')
        .toLowerCase()
        .trim();
      
      await updateProfile.mutateAsync({ custom_domain: normalizedDomain || null } as any);
      await refreshProfile();
      toast({ title: "Domínio salvo!" });
    } catch {
      toast({ title: "Erro ao salvar domínio", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SettingsHeader
        planName={planInfo.name}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {/* 
        Responsive Grid Layout:
        - Mobile (<768px): 1 column (stack)
        - Tablet/Laptop (768-1280px): 2 columns (40% + 60%)
        - Desktop (>1280px): 3 columns (25% + 50% + 25%)
      */}
      <div className="grid grid-cols-1 md:grid-cols-5 xl:grid-cols-12 gap-4 xl:gap-5">
        {/* 
          Left Column: Identity
          - Mobile: Full width
          - Tablet: 2/5 (40%)
          - Desktop: 3/12 (25%)
        */}
        <div className="md:col-span-2 xl:col-span-3 space-y-4">
          <IdentityContainer
            // Luma Profile
            lumaAvatarUrl={extendedProfile?.luma_avatar_url}
            lumaStatus={lumaStatus}
            lumaInitialMessage={lumaInitialMessage}
            isUploadingLumaAvatar={isUploadingLumaAvatar}
            onLumaStatusChange={setLumaStatus}
            onLumaMessageChange={setLumaInitialMessage}
            onLumaAvatarChange={handleLumaAvatarChange}
            // Studio Identity
            studioAvatarUrl={profile?.avatar_url || undefined}
            businessName={businessName}
            niche={niche}
            whatsappNumber={whatsappNumber}
            isUploadingStudioAvatar={isUploadingAvatar}
            onBusinessNameChange={setBusinessName}
            onNicheChange={setNiche}
            onWhatsappChange={setWhatsappNumber}
            onStudioAvatarChange={handleAvatarChange}
            // Google Calendar
            isCalendarConnected={googleCalendar.isConnected}
            isCalendarLoading={googleCalendar.isLoading}
            onCalendarConnect={googleCalendar.connect}
            onCalendarDisconnect={googleCalendar.disconnect}
          />

          {/* Technical Container - on tablet goes below Identity, on desktop goes to right column */}
          <div className="xl:hidden">
            <TechnicalContainer
              userId={user?.id}
              customDomain={customDomain}
              showStoryCarousel={showStoryCarousel}
              showCategoryChips={showCategoryChips}
              onDomainChange={setCustomDomain}
              onSaveDomain={handleSaveDomain}
              onStoryCarouselChange={setShowStoryCarousel}
              onCategoryChipsChange={setShowCategoryChips}
            />
          </div>
        </div>

        {/* 
          Center Column: Intelligence (Cérebro)
          - Mobile: Full width
          - Tablet: 3/5 (60%)
          - Desktop: 6/12 (50%)
        */}
        <div className="md:col-span-3 xl:col-span-6">
          <IntelligenceContainer
            aiContext={aiContext}
            bio={bio}
            pricingPackages={pricingPackages}
            onAiContextChange={setAiContext}
            onBioChange={setBio}
            onPricingPackagesChange={setPricingPackages}
          />
        </div>

        {/* 
          Right Column: Technical (only on desktop xl+)
          - Mobile/Tablet: Hidden (rendered above in left column)
          - Desktop: 3/12 (25%)
        */}
        <div className="hidden xl:block xl:col-span-3">
          <TechnicalContainer
            userId={user?.id}
            customDomain={customDomain}
            showStoryCarousel={showStoryCarousel}
            showCategoryChips={showCategoryChips}
            onDomainChange={setCustomDomain}
            onSaveDomain={handleSaveDomain}
            onStoryCarouselChange={setShowStoryCarousel}
            onCategoryChipsChange={setShowCategoryChips}
          />
        </div>
      </div>
    </div>
  );
}
