import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  Package, 
  GripVertical,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export interface PricingPackage {
  id: string;
  name: string;
  price: string;
  description: string;
  services: string[];
}

export interface PricingPackagesData {
  packages: PricingPackage[];
  allow_luma_share: boolean;
}

interface PricingPackagesEditorProps {
  value: PricingPackagesData;
  onChange: (data: PricingPackagesData) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const PricingPackagesEditor = forwardRef<HTMLDivElement, PricingPackagesEditorProps>(
  function PricingPackagesEditor({ value, onChange }, ref) {
  const [newService, setNewService] = useState<Record<string, string>>({});

  const addPackage = () => {
    const newPackage: PricingPackage = {
      id: generateId(),
      name: "",
      price: "",
      description: "",
      services: [],
    };
    onChange({
      ...value,
      packages: [...value.packages, newPackage],
    });
  };

  const updatePackage = (id: string, updates: Partial<PricingPackage>) => {
    onChange({
      ...value,
      packages: value.packages.map((pkg) =>
        pkg.id === id ? { ...pkg, ...updates } : pkg
      ),
    });
  };

  const removePackage = (id: string) => {
    onChange({
      ...value,
      packages: value.packages.filter((pkg) => pkg.id !== id),
    });
  };

  const addService = (packageId: string) => {
    const service = newService[packageId]?.trim();
    if (!service) return;

    const pkg = value.packages.find((p) => p.id === packageId);
    if (pkg) {
      updatePackage(packageId, {
        services: [...pkg.services, service],
      });
      setNewService((prev) => ({ ...prev, [packageId]: "" }));
    }
  };

  const removeService = (packageId: string, serviceIndex: number) => {
    const pkg = value.packages.find((p) => p.id === packageId);
    if (pkg) {
      updatePackage(packageId, {
        services: pkg.services.filter((_, i) => i !== serviceIndex),
      });
    }
  };

  const toggleLumaShare = () => {
    onChange({
      ...value,
      allow_luma_share: !value.allow_luma_share,
    });
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Header with Luma toggle */}
      <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {value.allow_luma_share ? (
              <Eye className="h-4 w-4 text-green-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium text-foreground">
              Luma pode compartilhar preços
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {value.allow_luma_share
              ? "A Luma vai usar esses preços exatos nas conversas com clientes"
              : "A Luma vai coletar dados e encaminhar para orçamento personalizado"}
          </p>
        </div>
        <Switch
          checked={value.allow_luma_share}
          onCheckedChange={toggleLumaShare}
        />
      </div>

      {/* Warning if sharing but no packages */}
      {value.allow_luma_share && value.packages.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">
            Adicione pelo menos um pacote para a Luma poder compartilhar preços.
          </p>
        </div>
      )}

      {/* Packages list */}
      <AnimatePresence mode="popLayout">
        {value.packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative p-5 rounded-xl border border-luma-glass-border bg-card/50 space-y-4"
          >
            {/* Package header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="h-4 w-4 cursor-grab" />
                <Badge variant="outline" className="text-xs">
                  Pacote {index + 1}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removePackage(pkg.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Package fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5" />
                  Nome do Pacote
                </Label>
                <Input
                  value={pkg.name}
                  onChange={(e) => updatePackage(pkg.id, { name: e.target.value })}
                  placeholder="Ex: Essencial, Premium, Completo"
                  className="glass border-luma-glass-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5" />
                  Preço
                </Label>
                <Input
                  value={pkg.price}
                  onChange={(e) => updatePackage(pkg.id, { price: e.target.value })}
                  placeholder="Ex: R$ 3.500 ou A partir de R$ 2.500"
                  className="glass border-luma-glass-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição Curta</Label>
              <Input
                value={pkg.description}
                onChange={(e) => updatePackage(pkg.id, { description: e.target.value })}
                placeholder="Ex: 6 horas de cobertura, ideal para cerimônias intimistas"
                className="glass border-luma-glass-border"
              />
            </div>

            {/* Services */}
            <div className="space-y-3">
              <Label>O que está incluso</Label>
              <div className="flex flex-wrap gap-2">
                {pkg.services.map((service, serviceIndex) => (
                  <Badge
                    key={serviceIndex}
                    variant="secondary"
                    className="gap-1 pr-1 bg-primary/10 text-primary border-primary/20"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(pkg.id, serviceIndex)}
                      className="ml-1 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newService[pkg.id] || ""}
                  onChange={(e) =>
                    setNewService((prev) => ({ ...prev, [pkg.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addService(pkg.id);
                    }
                  }}
                  placeholder="Ex: 300 fotos editadas, Álbum 30x30..."
                  className="glass border-luma-glass-border flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addService(pkg.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add package button */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 border-dashed border-2 h-14 hover:bg-primary/5 hover:border-primary/50"
        onClick={addPackage}
      >
        <Plus className="h-5 w-5" />
        Adicionar Pacote
      </Button>

      {/* Preview hint */}
      {value.packages.length > 0 && value.allow_luma_share && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <Sparkles className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Luma vai usar esses preços!
            </p>
            <p className="text-xs text-muted-foreground">
              Quando um cliente perguntar valores, a Luma vai citar EXATAMENTE os preços
              configurados aqui. Nunca vai inventar ou extrapolar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default PricingPackagesEditor;
