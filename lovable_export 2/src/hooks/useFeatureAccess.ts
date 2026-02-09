import { useAuth } from "@/contexts/AuthContext";
import { 
  getPlanLimit, 
  hasPortfolioAccess, 
  hasLumaChatAccess, 
  hasHeadlineAccess,
  hasProposalsAccess,
  hasDigitalSignatureAccess,
  getMaxCarouselPhotos,
  PlanType
} from "@/lib/planLimits";

export interface FeatureAccess {
  // Plan info
  plan: PlanType;
  isFree: boolean;
  isTrial: boolean;
  isPro: boolean;
  isUltra: boolean;
  hasProAccess: boolean; // Pro or higher
  
  // Feature flags
  hasPortfolio: boolean;
  hasLumaChat: boolean;
  hasHeadline: boolean;
  hasGallery: boolean;
  hasStories: boolean;
  hasVideo: boolean;
  hasPublicProfile: boolean;
  hasProposals: boolean;
  hasDigitalSignature: boolean;
  
  // Limits
  maxCarouselPhotos: number;
  maxStories: number;
  maxGalleries: number;
  maxLeads: number;
  maxProposals: number;
  maxProposalTemplates: number;
}

export function useFeatureAccess(): FeatureAccess {
  const { profile } = useAuth();
  const plan = (profile?.plan || 'trial') as PlanType;
  const limits = getPlanLimit(plan);
  
  const isFree = plan === 'free';
  const isTrial = plan === 'trial';
  const isPro = plan === 'pro';
  const isUltra = plan === 'ultra' || plan === 'enterprise';
  const hasProAccess = isPro || isUltra;
  
  return {
    // Plan info
    plan,
    isFree,
    isTrial,
    isPro,
    isUltra,
    hasProAccess,
    
    // Feature flags
    hasPortfolio: hasPortfolioAccess(plan),
    hasLumaChat: hasLumaChatAccess(plan),
    hasHeadline: hasHeadlineAccess(plan),
    hasGallery: limits.galleries > 0,
    hasStories: limits.stories > 0,
    hasVideo: limits.video,
    hasPublicProfile: limits.publicProfile,
    hasProposals: hasProposalsAccess(plan),
    hasDigitalSignature: hasDigitalSignatureAccess(plan),
    
    // Limits
    maxCarouselPhotos: getMaxCarouselPhotos(plan),
    maxStories: limits.stories,
    maxGalleries: limits.galleries,
    maxLeads: limits.leadsLimit,
    maxProposals: limits.proposals,
    maxProposalTemplates: limits.proposalTemplates,
  };
}
