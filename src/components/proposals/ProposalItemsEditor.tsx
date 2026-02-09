import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  Package, 
  GripVertical,
  Percent,
  Calculator,
  Eye,
  EyeOff,
  FileText
} from "lucide-react";
import { ItemCategorySelector, type ItemCategory } from "./ItemCategorySelector";

export interface ProposalItem {
  id?: string;
  name: string;           // Nome curto do item
  description?: string;   // Mantido para compatibilidade com dados antigos
  details?: string;       // Descrição longa/detalhes
  quantity: number;
  unit_price: number;
  show_price: boolean;    // Se deve exibir o preço para o cliente
  order_index: number;
  category?: ItemCategory; // Categoria para propostas de vídeo
}

interface ProposalItemsEditorProps {
  items: ProposalItem[];
  onChange: (items: ProposalItem[]) => void;
  discountAmount: number;
  onDiscountChange: (discount: number) => void;
  // Props for manual total
  useManualTotal?: boolean;
  onUseManualTotalChange?: (useManual: boolean) => void;
  manualTotalAmount?: number;
  onManualTotalChange?: (amount: number) => void;
  // Video mode
  isVideoMode?: boolean;
}

interface ProposalItemsEditorProps {
  items: ProposalItem[];
  onChange: (items: ProposalItem[]) => void;
  discountAmount: number;
  onDiscountChange: (discount: number) => void;
  // Props for manual total
  useManualTotal?: boolean;
  onUseManualTotalChange?: (useManual: boolean) => void;
  manualTotalAmount?: number;
  onManualTotalChange?: (amount: number) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function ProposalItemsEditor({ 
  items, 
  onChange, 
  discountAmount, 
  onDiscountChange,
  useManualTotal = false,
  onUseManualTotalChange,
  manualTotalAmount = 0,
  onManualTotalChange,
  isVideoMode = false,
}: ProposalItemsEditorProps) {
  
  const addItem = () => {
    const newItem: ProposalItem = {
      id: generateId(),
      name: "",
      details: "",
      quantity: 1,
      unit_price: 0,
      show_price: true,
      order_index: items.length,
      category: isVideoMode ? "production" : null,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, updates: Partial<ProposalItem>) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Only count items with show_price=true for display total
  const subtotal = useManualTotal 
    ? manualTotalAmount 
    : items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const total = subtotal - discountAmount;

  return (
    <div className="space-y-6">
      {/* Toggle between manual and itemized */}
      {onUseManualTotalChange && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Modo de Precificação</p>
              <p className="text-xs text-muted-foreground">
                {useManualTotal 
                  ? "Definir valor total diretamente" 
                  : "Calcular a partir dos itens"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${!useManualTotal ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Por Itens
            </span>
            <Switch
              checked={useManualTotal}
              onCheckedChange={onUseManualTotalChange}
            />
            <span className={`text-xs ${useManualTotal ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              Manual
            </span>
          </div>
        </div>
      )}

      {/* Manual Total Input */}
      {useManualTotal && onManualTotalChange && (
        <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Valor Total do Serviço
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={manualTotalAmount || ""}
                onChange={(e) => onManualTotalChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="text-2xl h-14 font-bold glass border-luma-glass-border"
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Desconto (R$)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount || ""}
                  onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="glass border-luma-glass-border"
                />
              </div>
              
              <div className="flex flex-col justify-end">
                <p className="text-sm text-muted-foreground mb-1">Total Final</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Itemized Mode */}
      {!useManualTotal && (
        <>
          {/* Items list */}
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative p-5 rounded-xl border border-luma-glass-border bg-card/50 space-y-4"
              >
                {/* Item header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-4 w-4 cursor-grab" />
                    <Badge variant="outline" className="text-xs">
                      Item {index + 1}
                    </Badge>
                    {!item.show_price && (
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                        Incluso
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Item fields */}
                <div className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5" />
                      Nome do Item
                    </Label>
                    <Input
                      value={item.name || item.description || ""}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      placeholder="Ex: Cobertura Fotográfica - 8 horas"
                      className="glass border-luma-glass-border"
                    />
                  </div>
                  
                  {/* Details field (optional) */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Descrição / Detalhes (opcional)
                    </Label>
                    <Textarea
                      value={item.details || ""}
                      onChange={(e) => updateItem(index, { details: e.target.value })}
                      placeholder="Descreva o que está incluso neste item, entregas, especificações..."
                      className="glass border-luma-glass-border min-h-[80px] text-sm"
                    />
                  </div>
                  
                  {/* Category Selector - Video mode only */}
                  {isVideoMode && (
                    <ItemCategorySelector
                      value={item.category || null}
                      onChange={(category) => updateItem(index, { category })}
                    />
                  )}
                  
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                        className="glass border-luma-glass-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5" />
                        Preço Unitário
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, { unit_price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        className="glass border-luma-glass-border"
                        disabled={!item.show_price}
                      />
                    </div>
                    
                    {/* Show price toggle */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        {item.show_price ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        Exibir Preço
                      </Label>
                      <div className="flex items-center gap-3 h-10">
                        <Switch
                          checked={item.show_price}
                          onCheckedChange={(checked) => updateItem(index, { show_price: checked })}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.show_price ? "Visível" : "Incluso"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Item total */}
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Subtotal do item</p>
                      {item.show_price ? (
                        <p className="font-semibold text-foreground">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </p>
                      ) : (
                        <p className="font-medium text-green-400">Incluso no pacote</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add item button */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-dashed border-2 h-14 hover:bg-primary/5 hover:border-primary/50"
            onClick={addItem}
          >
            <Plus className="h-5 w-5" />
            Adicionar Item
          </Button>

          {/* Discount and Total */}
          {items.length > 0 && (
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 max-w-xs">
                  <Label className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Desconto (R$)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountAmount || ""}
                    onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="glass border-luma-glass-border"
                  />
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-4 text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-end gap-4 text-emerald-600">
                      <span>Desconto:</span>
                      <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-4 text-lg">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-primary text-2xl">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
