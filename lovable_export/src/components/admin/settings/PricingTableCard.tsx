import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { PricingPackage, PricingPackagesData } from "@/components/admin/PricingPackagesEditor";

interface PricingTableCardProps {
  value: PricingPackagesData;
  onChange: (data: PricingPackagesData) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function PricingTableCard({ value, onChange }: PricingTableCardProps) {
  const [newService, setNewService] = useState<Record<string, string>>({});

  const toggleLumaShare = () => {
    onChange({
      ...value,
      allow_luma_share: !value.allow_luma_share,
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

  return (
    <Card className="bento-card border-green-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            Tabela de Preços
          </CardTitle>
          <Switch
            checked={value.allow_luma_share}
            onCheckedChange={toggleLumaShare}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {value.allow_luma_share
            ? "Luma compartilha preços"
            : "Apenas coleta de dados"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {value.packages.length > 0 ? (
          <Accordion type="multiple" className="space-y-2">
            {value.packages.map((pkg) => (
              <AccordionItem
                key={pkg.id}
                value={pkg.id}
                className="border border-luma-glass-border rounded-lg px-3 data-[state=open]:bg-card/50"
              >
                <AccordionTrigger className="py-2.5 hover:no-underline">
                  <div className="flex items-center justify-between flex-1 pr-2">
                    <span className="font-medium text-sm text-left">
                      {pkg.name || "Novo Pacote"}
                    </span>
                    <span className="text-primary font-bold text-sm">
                      {pkg.price || "—"}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Nome</Label>
                    <Input
                      value={pkg.name}
                      onChange={(e) =>
                        updatePackage(pkg.id, { name: e.target.value })
                      }
                      placeholder="Ex: Essencial"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Preço</Label>
                    <Input
                      value={pkg.price}
                      onChange={(e) =>
                        updatePackage(pkg.id, { price: e.target.value })
                      }
                      placeholder="Ex: R$ 3.500"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Descrição</Label>
                    <Input
                      value={pkg.description}
                      onChange={(e) =>
                        updatePackage(pkg.id, { description: e.target.value })
                      }
                      placeholder="Ex: 6 horas de cobertura"
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    <Label className="text-xs">Incluso</Label>
                    {pkg.services.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pkg.services.map((s, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs gap-1 pr-1"
                          >
                            {s}
                            <button
                              type="button"
                              onClick={() => removeService(pkg.id, i)}
                              className="ml-0.5 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive"
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
                        className="h-8 text-sm flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => addService(pkg.id)}
                      >
                        <Plus className="h-3.5 w-3.5" />
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
          <p className="text-xs text-muted-foreground text-center py-2">
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
      </CardContent>
    </Card>
  );
}
