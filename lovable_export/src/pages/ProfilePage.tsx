import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { usePublicProfile } from "@/hooks/usePublicData";
import { useStories } from "@/hooks/useStories";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import ligaLogoWhite from "@/assets/liga-logo-white.png";
import ligaLogoDark from "@/assets/liga-logo-gold.png";
import lumaLogoWhite from "@/assets/luma-logo-white.png";
import { Button } from "@/components/ui/button";

// Profile Components
import { HeroSection } from "@/components/profile/HeroSection";
import { PortfolioSection } from "@/components/profile/PortfolioSection";
import { AboutSection } from "@/components/profile/AboutSection";
import { ContactSection } from "@/components/profile/ContactSection";
import { GalleryViewer } from "@/components/profile/GalleryViewer";
import { ActionButton } from "@/components/profile/ActionButtons";
import { CarouselSection } from "@/components/minisite/CarouselSection";
import { useCarouselPhotos } from "@/hooks/useMinisiteCarousel";
import { MinisiteThemeProvider, MinisiteTheme } from "@/components/minisite/MinisiteThemeProvider";

type StoryChapter = Tables<"story_chapters">;
type Story = Tables<"stories"> & {
  story_chapters?: StoryChapter[];
};

interface GalleryData {
  id: string;
  title: string;
  profileId: string;
  chapters: StoryChapter[];
}

export default function ProfilePage() {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Para Clean URLs (saibamais.app/:slug), extrair slug do pathname
  // Para rotas normais (/p/:slug), usar o param do React Router
  const cleanSlug = location.pathname.startsWith("/p/") 
    ? null 
    : location.pathname.substring(1).split("/")[0]; // Remove leading slash e pega primeiro segmento
  
  const slug = paramSlug || cleanSlug;
  
  const { data: profile, isLoading: profileLoading } = usePublicProfile(slug);
  const [viewingGallery, setViewingGallery] = useState<GalleryData | null>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

  // Fetch published stories for this profile
  const { data: stories, isLoading: storiesLoading } = useStories(profile?.id);
  const publishedStories = (stories?.filter(s => s.is_published) || []) as Story[];

  // Fetch carousel photos for this profile
  const { data: carouselPhotos = [] } = useCarouselPhotos(profile?.id);

  // Parse action buttons from JSONB
  const actionButtons: ActionButton[] = (() => {
    try {
      const buttons = profile?.action_buttons;
      if (Array.isArray(buttons)) {
        return buttons as unknown as ActionButton[];
      }
      return [];
    } catch {
      return [];
    }
  })();

  const handleStoryClick = async (story: Story) => {
    if (!profile) return;

    // If story already has chapters loaded, use them
    if (story.story_chapters && story.story_chapters.length > 0) {
      const sortedChapters = [...story.story_chapters].sort((a, b) => a.order_index - b.order_index);
      setViewingGallery({
        id: story.id,
        title: story.title,
        profileId: profile.id,
        chapters: sortedChapters,
      });
      return;
    }

    // Otherwise fetch chapters
    const { data: storyData, error } = await supabase
      .from("stories")
      .select(`
        id,
        title,
        story_chapters (
          id,
          story_id,
          media_url,
          media_type,
          narrative_text,
          order_index,
          created_at
        )
      `)
      .eq("id", story.id)
      .single();

    if (!error && storyData) {
      const sortedChapters = (storyData.story_chapters || []).sort((a, b) => a.order_index - b.order_index);
      setViewingGallery({
        id: storyData.id,
        title: storyData.title,
        profileId: profile.id,
        chapters: sortedChapters as StoryChapter[],
      });
    }
  };

  const handleChatClick = () => {
    navigate(`/chat/${slug}`);
  };

  const handleScrollToPortfolio = () => {
    portfolioRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Loading State
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  // Not Found State
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <img src={lumaLogoWhite} alt="Luma" className="h-12 opacity-50" />
        <h1 className="text-xl font-semibold text-foreground">Perfil não encontrado</h1>
        <p className="text-muted-foreground text-center">
          Este perfil não existe ou ainda não foi publicado.
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  // Determine carousel layout
  const carouselLayout = (profile.minisite_carousel_layout as "carousel" | "pinterest") || "carousel";
  
  // Determine theme
  const currentTheme = (profile.minisite_theme as MinisiteTheme) || 'dark';
  const isEditorialTheme = currentTheme === 'editorial';

  // Select appropriate logos based on theme
  const ligaLogo = isEditorialTheme ? ligaLogoDark : ligaLogoWhite;

  return (
    <MinisiteThemeProvider theme={currentTheme}>
      {/* Hero Section */}
      <HeroSection
        businessName={profile.business_name}
        niche={profile.niche}
        bio={profile.bio}
        avatarUrl={profile.minisite_avatar_url || profile.avatar_url}
        coverUrl={profile.minisite_cover_url}
        actionButtons={actionButtons}
        onScrollDown={publishedStories.length > 0 || carouselPhotos.length > 0 ? handleScrollToPortfolio : undefined}
        headline={profile.minisite_headline}
        subheadline={profile.minisite_subheadline}
        theme={currentTheme}
      />

      {/* Carousel Section */}
      {carouselPhotos.length > 0 && (
        <CarouselSection 
          photos={carouselPhotos} 
          layout={carouselLayout} 
        />
      )}

      {/* Portfolio Section */}
      <div ref={portfolioRef}>
        <PortfolioSection
          stories={publishedStories}
          onStoryClick={handleStoryClick}
          theme={currentTheme}
        />
      </div>

      {/* About Section */}
      <AboutSection
        photoUrl={profile.about_photo_url}
        videoUrl={profile.about_video_url}
        text={profile.about_text}
        businessName={profile.business_name}
        theme={currentTheme}
      />

      {/* Contact Section - All users have full access */}
      <ContactSection
        onChatClick={handleChatClick}
        whatsappNumber={profile.whatsapp_number}
        businessName={profile.business_name}
        theme={currentTheme}
      />

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <img src={ligaLogo} alt="Liga da Fotografia" className="h-4" />
          </div>
          <p className="text-[10px] text-muted-foreground/50">
            © {new Date().getFullYear()} {profile.business_name}. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Gallery Viewer Modal */}
      {viewingGallery && (
        <GalleryViewer
          storyId={viewingGallery.id}
          storyTitle={viewingGallery.title}
          profileId={viewingGallery.profileId}
          chapters={viewingGallery.chapters}
          onClose={() => setViewingGallery(null)}
          onRequestQuote={handleChatClick}
        />
      )}
    </MinisiteThemeProvider>
  );
}
