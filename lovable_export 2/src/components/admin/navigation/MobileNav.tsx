import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { PwaInstallModal } from "@/components/pwa/PwaInstallModal";
import { getTrialDaysRemaining } from "@/lib/planLimits";
import { MobileNavBar } from "./MobileNavBar";
import { MobileNavSheet } from "./MobileNavSheet";

export function MobileNav() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { isInstallable, isInstalled, isIOSSafari, install } = usePwaInstall();
  
  const [showSheet, setShowSheet] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  // Check plan access
  const trialDaysRemaining = getTrialDaysRemaining(profile?.trial_ends_at);
  const isFreeUser = profile?.plan === 'free';
  const isTrialExpired = profile?.plan === 'trial' && 
    (trialDaysRemaining === null || trialDaysRemaining <= 0);
  const isRestricted = isFreeUser || isTrialExpired;
  
  const showInstallButton = isInstallable && !isInstalled;

  const handleSignOut = async () => {
    setShowSheet(false);
    await signOut();
    navigate("/auth");
  };

  return (
    <>
      {/* PWA Install Modal */}
      <PwaInstallModal
        open={showInstallModal}
        onOpenChange={setShowInstallModal}
        isIOSSafari={isIOSSafari}
        onInstall={install}
      />

      {/* Bottom Navigation Bar */}
      <MobileNavBar
        onMoreClick={() => setShowSheet(true)}
        isMoreOpen={showSheet}
        isRestricted={isRestricted}
        showNotificationDot={showInstallButton}
      />

      {/* Navigation Sheet */}
      <MobileNavSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        profile={profile}
        isRestricted={isRestricted}
        onSignOut={handleSignOut}
      />
    </>
  );
}
