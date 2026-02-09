import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Brain, DollarSign, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface IntelligenceContainerProps {
  aiContext: string;
  bio: string;
  pricingPackages: PricingPackagesData;
  onAiContextChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onPricingPackagesChange: (data: PricingPackagesData) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function IntelligenceContainer({
  aiContext,
  bio,
  pricingPackages,
  onAiContextChange,
  onBioChange,
  onPricingPackagesChange,
}: IntelligenceContainerProps) {
  const [newService, setNewService] = useState<Record<string, string>>({});

  const toggleLumaShare = () => {
    onPricingPackagesChange({
      ...pricingPackages,
      allow_luma_share: !pricingPackages.allow_luma_share,
    });
  };

  const addPackage = () => {
    const newPackage: PricingPackage = {
      id: generateId(),
      name: "",
      price: "",
      description: "",
      services: [],
    };
    onPricingPackagesChange({
      ...pricingPackages,
      packages: [...pricingPackages.packages, newPackage],
    });
  };

  const updatePackage = (id: string, updates: Partial<PricingPackage>) => {
    onPricingPackagesChange({
      ...pricingPackages,
      packages: pricingPackages.packages.map((pkg) =>
        pkg.id === id ? { ...pkg, ...updates } : pkg
      ),
    });
  };

  const removePackage = (id: string) => {
    onPricingPackagesChange({
      ...pricingPackages,
      packages: pricingPackages.packages.filter((pkg) => pkg.id !== id),
    });
  };

  const addService = (packageId: string) => {
    const service = newService[packageId]?.trim();
    if (!service) return;

    const pkg = pricingPackages.packages.find((p) => p.id === packageId);
    if (pkg) {
      updatePackage(packageId, {
        services: [...pkg.services, service],
      });
      setNewService((prev) => ({ ...prev, [packageId]: "" }));
    }
  };

  const removeService = (packageId: string, serviceIndex: number) => {
    const pkg = pricingPackages.packages.find((p) => p.id === packageId);
    if (pkg) {
      updatePackage(packageId, {
        services: pkg.services.filter((_, i) => i !== serviceIndex),
      });
    }
  };

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-luma-glass-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Brain className="h-4 w-4 text-secondary flex-shrink-0" />
            Cérebro da Luma
          </CardTitle>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            IA
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* === SYSTEM INSTRUCTIONS SECTION === */}
        <div className="space-y-4">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Instruções do Sistema
          </Label>
          
          {/* Code editor style textarea */}
          <div className="relative">
            <Textarea
              value={aiContext}
              onChange={(e) => onAiContextChange(e.target.value)}
              placeholder={`Exemplos de instruções:

• Sou fotógrafo de casamentos em São Paulo
• Não trabalho aos domingos
• Meu estilo é documental e espontâneo
• Preços começam em R$ 3.000 para ensaios
• Sempre pergunte a data e local primeiro`}
              className={cn(
                "min-h-[200px] md:min-h-[280px] resize-y w-full",
                "font-mono text-sm leading-relaxed",
                "bg-black/50 border-secondary/20",
                "focus:ring-secondary/30 focus:border-secondary/40",
                "placeholder:text-muted-foreground/40",
                "p-4 whitespace-pre-wrap break-words"
              )}
            />
            <div className="absolute top-3 right-3">
              <Badge className="bg-secondary/20 text-secondary text-xs">
                Markdown
              </Badge>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            💡 Quanto mais específico, melhor a Luma vai representar você.
          </p>

          {/* Bio as additional context */}
          <div className="space-y-2 pt-4 border-t border-luma-glass-border">
            <Label className="text-xs flex items-center gap-2 flex-wrap">
              Bio do Estúdio
              <span className="text-muted-foreground">(visível para a IA)</span>
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => onBioChange(e.target.value)}
              placeholder="Conte sobre seu trabalho..."
              className="min-h-[100px] text-sm resize-y w-full whitespace-normal break-words"
            />
          </div>
        </div>

        <Separator className="bg-luma-glass-border" />

        {/* === PRICING TABLE SECTION === */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              Tabela de Preços
            </Label>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {pricingPackages.allow_luma_share
                  ? "Luma compartilha"
                  : "Apenas coleta"}
              </span>
              <Switch
                checked={pricingPackages.allow_luma_share}
                onCheckedChange={toggleLumaShare}
              />
            </div>
          </div>

          {pricingPackages.packages.length > 0 ? (
            <Accordion type="multiple" className="space-y-2">
              {pricingPackages.packages.map((pkg) => (
                <AccordionItem
                  key={pkg.id}
                  value={pkg.id}
                  className="border border-luma-glass-border rounded-lg px-4 data-[state=open]:bg-card/30"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center justify-between flex-1 pr-3 min-w-0 gap-3">
                      <span className="font-medium text-sm text-left truncate">
                        {pkg.name || "Novo Pacote"}
                      </span>
                      <span className="text-primary font-bold text-sm flex-shrink-0">
                        {pkg.price || "—"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Nome</Label>
                        <Input
                          value={pkg.name}
                          onChange={(e) =>
                            updatePackage(pkg.id, { name: e.target.value })
                          }
                          placeholder="Ex: Essencial"
                          className="h-9 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Preço</Label>
                        <Input
                          value={pkg.price}
                          onChange={(e) =>
                            updatePackage(pkg.id, { price: e.target.value })
                          }
                          placeholder="Ex: R$ 3.500"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Descrição</Label>
                      <Input
                        value={pkg.description}
                        onChange={(e) =>
                          updatePackage(pkg.id, { description: e.target.value })
                        }
                        placeholder="Ex: 6 horas de cobertura"
                        className="h-9 text-sm"
                      />
                    </div>

                    {/* Services */}
                    <div className="space-y-2">
                      <Label className="text-xs">Incluso</Label>
                      {pkg.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {pkg.services.map((s, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs gap-1 pr-1"
                            >
                              <span className="truncate max-w-[120px]">{s}</span>
                              <button
                                type="button"
                                onClick={() => removeService(pkg.id, i)}
                                className="ml-0.5 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={newService[pkg.id] || ""}
                          onChange={(e) =>
                            setNewService((prev) => ({
                              ...prev,
                              [pkg.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addService(pkg.id);
                            }
                          }}
                          placeholder="Ex: 300 fotos"
                          className="h-9 text-sm flex-1 min-w-0"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 flex-shrink-0"
                          onClick={() => addService(pkg.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full mt-2"
                      onClick={() => removePackage(pkg.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Remover Pacote
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhum pacote configurado
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed gap-1.5"
            onClick={addPackage}
          >
            <Plus className="h-4 w-4" />
            Adicionar Pacote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
