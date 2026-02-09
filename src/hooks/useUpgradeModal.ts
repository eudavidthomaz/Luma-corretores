import { useState, useCallback } from "react";
import { UpgradeFeature } from "@/components/admin/UpgradeModal";

interface UseUpgradeModalReturn {
  isOpen: boolean;
  feature: UpgradeFeature;
  requiredPlan: "pro" | "ultra" | undefined;
  customTitle: string | undefined;
  customDescription: string | undefined;
  open: (options?: {
    feature?: UpgradeFeature;
    requiredPlan?: "pro" | "ultra";
    customTitle?: string;
    customDescription?: string;
  }) => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}

export function useUpgradeModal(): UseUpgradeModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState<UpgradeFeature>("general");
  const [requiredPlan, setRequiredPlan] = useState<"pro" | "ultra" | undefined>(undefined);
  const [customTitle, setCustomTitle] = useState<string | undefined>(undefined);
  const [customDescription, setCustomDescription] = useState<string | undefined>(undefined);

  const open = useCallback((options?: {
    feature?: UpgradeFeature;
    requiredPlan?: "pro" | "ultra";
    customTitle?: string;
    customDescription?: string;
  }) => {
    setFeature(options?.feature || "general");
    setRequiredPlan(options?.requiredPlan);
    setCustomTitle(options?.customTitle);
    setCustomDescription(options?.customDescription);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return {
    isOpen,
    feature,
    requiredPlan,
    customTitle,
    customDescription,
    open,
    close,
    setOpen,
  };
}
