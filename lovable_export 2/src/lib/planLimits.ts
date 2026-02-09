export type PlanType = 'pending' | 'trial' | 'lite' | 'pro' | 'ultra' | 'free' | 'enterprise';

export interface PlanLimit {
  stories: number;
  photosPerStory: number;
  video: boolean;
  publicProfile: boolean;
  leadsLimit: number;
  // Luma Gallery limits
  galleries: number;
  galleryStorageGB: number;
  galleryDurationDays: number;
  // Mini-site limits
  minisiteCarouselPhotos: number;
  hasLumaChat: boolean;
  hasPortfolio: boolean;
  hasHeadline: boolean;
  // Smart Proposals limits
  proposals: number;
  proposalTemplates: number;
  hasDigitalSignature: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimit> = {
  pending: { 
    stories: 0, 
    photosPerStory: 0, 
    video: false, 
    publicProfile: false, 
    leadsLimit: 0,
    galleries: 0,
    galleryStorageGB: 0,
    galleryDurationDays: 0,
    minisiteCarouselPhotos: 0,
    hasLumaChat: false,
    hasPortfolio: false,
    hasHeadline: false,
    proposals: 0,
    proposalTemplates: 0,
    hasDigitalSignature: false,
  },
  trial: { 
    stories: 3, 
    photosPerStory: 10, 
    video: false, 
    publicProfile: false, 
    leadsLimit: 10,
    galleries: 1,
    galleryStorageGB: 0.5,
    galleryDurationDays: 7,
    minisiteCarouselPhotos: 10,
    hasLumaChat: true,
    hasPortfolio: true,
    hasHeadline: true,
    proposals: 3,
    proposalTemplates: 1,
    hasDigitalSignature: true,
  },
  free: { 
    stories: 0, 
    photosPerStory: 0, 
    video: false, 
    publicProfile: true,
    leadsLimit: 0,
    galleries: 0,
    galleryStorageGB: 0,
    galleryDurationDays: 0,
    minisiteCarouselPhotos: 10,
    hasLumaChat: false,
    hasPortfolio: false,
    hasHeadline: true,
    proposals: 0,
    proposalTemplates: 0,
    hasDigitalSignature: false,
  },
  lite: { 
    stories: 0, 
    photosPerStory: 0, 
    video: false, 
    publicProfile: false, 
    leadsLimit: 50,
    galleries: 0,
    galleryStorageGB: 0,
    galleryDurationDays: 0,
    minisiteCarouselPhotos: 0,
    hasLumaChat: true,
    hasPortfolio: false,
    hasHeadline: false,
    proposals: 10,
    proposalTemplates: 3,
    hasDigitalSignature: true,
  },
  pro: { 
    stories: 10, 
    photosPerStory: 20, 
    video: false, 
    publicProfile: true, 
    leadsLimit: 200,
    galleries: 5,
    galleryStorageGB: 2,
    galleryDurationDays: 15,
    minisiteCarouselPhotos: 10,
    hasLumaChat: true,
    hasPortfolio: true,
    hasHeadline: true,
    proposals: 50,
    proposalTemplates: 10,
    hasDigitalSignature: true,
  },
  ultra: { 
    stories: 30, 
    photosPerStory: 30, 
    video: true, 
    publicProfile: true, 
    leadsLimit: 1000,
    galleries: 999,
    galleryStorageGB: 5,
    galleryDurationDays: 30,
    minisiteCarouselPhotos: 10,
    hasLumaChat: true,
    hasPortfolio: true,
    hasHeadline: true,
    proposals: 999,
    proposalTemplates: 999,
    hasDigitalSignature: true,
  },
  enterprise: { 
    stories: 30, 
    photosPerStory: 30, 
    video: true, 
    publicProfile: true, 
    leadsLimit: 1000,
    galleries: 999,
    galleryStorageGB: 5,
    galleryDurationDays: 30,
    minisiteCarouselPhotos: 10,
    hasLumaChat: true,
    hasPortfolio: true,
    hasHeadline: true,
    proposals: 999,
    proposalTemplates: 999,
    hasDigitalSignature: true,
  },
};

export const PLAN_DETAILS = {
  pending: {
    name: 'Pending',
    subtitle: 'Aguardando Pagamento',
    price: 0,
    period: '',
    color: 'from-gray-400 to-gray-600',
  },
  free: {
    name: 'Free',
    subtitle: 'Comece Grátis',
    price: 0,
    period: 'para sempre',
    color: 'from-gray-400 to-gray-600',
  },
  trial: {
    name: 'Trial',
    subtitle: 'Teste Grátis',
    price: 0,
    period: '7 dias',
    color: 'from-amber-500 to-orange-500',
  },
  lite: {
    name: 'Lite',
    subtitle: 'O Porteiro',
    price: 47,
    period: '/mês',
    color: 'from-slate-400 to-slate-600',
  },
  pro: {
    name: 'Pro',
    subtitle: 'O Vendedor',
    price: 97,
    period: '/mês',
    color: 'from-primary to-primary/80',
    popular: true,
  },
  ultra: {
    name: 'Ultra',
    subtitle: 'A Escala',
    price: 187,
    period: '/mês',
    color: 'from-violet-500 to-purple-600',
  },
};

export function getPlanLimit(plan: string | undefined | null): PlanLimit {
  const normalizedPlan = (plan || 'pending') as PlanType;
  return PLAN_LIMITS[normalizedPlan] || PLAN_LIMITS.pending;
}

export function canCreateStory(plan: string | undefined | null, currentStoryCount: number): boolean {
  const limits = getPlanLimit(plan);
  return currentStoryCount < limits.stories;
}

export function canUploadMedia(plan: string | undefined | null, currentPhotoCount: number, isVideo: boolean): boolean {
  const limits = getPlanLimit(plan);
  if (isVideo && !limits.video) return false;
  return currentPhotoCount < limits.photosPerStory;
}

export function hasPublicProfile(plan: string | undefined | null): boolean {
  return getPlanLimit(plan).publicProfile;
}

export function canCreateGallery(plan: string | undefined | null, currentGalleryCount: number): boolean {
  const limits = getPlanLimit(plan);
  return currentGalleryCount < limits.galleries;
}

export function getGalleryStorageLimitBytes(plan: string | undefined | null): number {
  const limits = getPlanLimit(plan);
  return limits.galleryStorageGB * 1024 * 1024 * 1024;
}

export function getGalleryDefaultExpiration(plan: string | undefined | null): Date {
  const limits = getPlanLimit(plan);
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + limits.galleryDurationDays);
  return expirationDate;
}

export function getTrialDaysRemaining(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// New helper functions for feature access
export function hasPortfolioAccess(plan: string | undefined | null): boolean {
  return getPlanLimit(plan).hasPortfolio;
}

export function hasLumaChatAccess(plan: string | undefined | null): boolean {
  return getPlanLimit(plan).hasLumaChat;
}

export function hasHeadlineAccess(plan: string | undefined | null): boolean {
  return getPlanLimit(plan).hasHeadline;
}

export function getMaxCarouselPhotos(plan: string | undefined | null): number {
  return getPlanLimit(plan).minisiteCarouselPhotos;
}

// Smart Proposals helpers
export function canCreateProposal(plan: string | null | undefined, currentCount: number): boolean {
  const limits = getPlanLimit(plan);
  return currentCount < limits.proposals;
}

export function hasProposalsAccess(plan: string | null | undefined): boolean {
  return getPlanLimit(plan).proposals > 0;
}

export function hasDigitalSignatureAccess(plan: string | null | undefined): boolean {
  return getPlanLimit(plan).hasDigitalSignature;
}
