import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import EmbedChatPage from "./pages/EmbedChatPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStories from "./pages/admin/AdminStories";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSubscription from "./pages/admin/AdminSubscription";
import NewStoryPage from "./pages/admin/NewStoryPage";
import EditStoryPage from "./pages/admin/EditStoryPage";
import AdminMinisite from "./pages/admin/AdminMinisite";
import AdminGallery from "./pages/admin/AdminGallery";
import NewGalleryPage from "./pages/admin/NewGalleryPage";
import EditGalleryPage from "./pages/admin/EditGalleryPage";
import PublicGalleryPage from "./pages/PublicGalleryPage";
import AdminProposals from "./pages/admin/AdminProposals";
import AdminProposalTemplates from "./pages/admin/AdminProposalTemplates";
import EditProposalPage from "./pages/admin/EditProposalPage";
import PublicProposalPage from "./pages/PublicProposalPage";
import NotFound from "./pages/NotFound";
import { CleanUrlHandler } from "./components/routing/CleanUrlHandler";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:slug" element={<ChatPage />} />
            <Route path="/embed/:userId" element={<EmbedChatPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/p/:slug" element={<ProfilePage />} />
            <Route path="/g/:profileSlug/:gallerySlug" element={<PublicGalleryPage />} />
            <Route path="/proposta/:token" element={<PublicProposalPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="stories" element={<AdminStories />} />
              <Route path="stories/new" element={<NewStoryPage />} />
              <Route path="stories/:id" element={<EditStoryPage />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="gallery/new" element={<NewGalleryPage />} />
              <Route path="gallery/:id" element={<EditGalleryPage />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="proposals" element={<AdminProposals />} />
              <Route path="proposals/templates" element={<AdminProposalTemplates />} />
              <Route path="proposals/new" element={<EditProposalPage />} />
              <Route path="proposals/:id" element={<EditProposalPage />} />
              <Route path="subscription" element={<AdminSubscription />} />
              <Route path="minisite" element={<AdminMinisite />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Landing Page */}
            <Route path="/" element={<Index />} />
            
            {/* Catch-all inteligente - Clean URLs para domínios alternativos */}
            <Route path="*" element={<CleanUrlHandler />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
