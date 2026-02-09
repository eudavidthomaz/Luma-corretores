import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  FileText, 
  Package, 
  CreditCard,
  Settings,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  useProposalTemplate, 
  useCreateProposalTemplate,
  useUpdateProposalTemplate,
  templateItemsToEditorItems
} from "@/hooks/useProposalTemplates";
import { ProposalItemsEditor, ProposalItem } from "./ProposalItemsEditor";
import { ContractEditor } from "./ContractEditor";
import { PaymentConfigSelector } from "./PaymentConfigSelector";

interface TemplateEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string | null;
  profileId: string;
}

export function TemplateEditorModal({
  open,
  onOpenChange,
  templateId,
  profileId,
}: TemplateEditorModalProps) {
  const { toast } = useToast();
  const isEditing = !!templateId;
  
  const { data: existingTemplate, isLoading: isLoadingTemplate } = useProposalTemplate(templateId || undefined);
  const createTemplate = useCreateProposalTemplate();
  const updateTemplate = useUpdateProposalTemplate();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validDays, setValidDays] = useState(30);
  const [contractContent, setContractContent] = useState("");
  const [paymentConfigId, setPaymentConfigId] = useState<string | null>(null);
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load existing template data
  useEffect(() => {
    if (existingTemplate && isEditing) {
      setTitle(existingTemplate.title || "");
      setDescription(existingTemplate.description || "");
      setValidDays(existingTemplate.default_valid_days || 30);
      setContractContent(existingTemplate.content || "");
      setPaymentConfigId(existingTemplate.default_payment_config_id || null);
      
      // Convert template items to editor format
      const templateItems = existingTemplate.default_items as unknown[];
      if (Array.isArray(templateItems)) {
        setItems(templateItemsToEditorItems(templateItems).map((item, idx) => ({
          ...item,
          order_index: idx,
        })));
      }
    } else if (!isEditing) {
      // Reset form for new template
      setTitle("");
      setDescription("");
      setValidDays(30);
      setContractContent("");
      setPaymentConfigId(null);
      setItems([]);
      setDiscountAmount(0);
    }
  }, [existingTemplate, isEditing, open]);
  
  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para o template.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Convert items to JSON format for storage
      const itemsJson = items.map((item, index) => ({
        name: item.name,
        details: item.details || "",
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        show_price: item.show_price !== false,
        order_index: index,
      }));
      
      const templateData = {
        profile_id: profileId,
        title: title.trim(),
        description: description.trim() || null,
        content: contractContent.trim() || "",
        default_items: itemsJson,
        default_payment_config_id: paymentConfigId,
        default_valid_days: validDays,
      };
      
      if (isEditing && templateId) {
        await updateTemplate.mutateAsync({ id: templateId, ...templateData });
        toast({
          title: "Template atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        await createTemplate.mutateAsync(templateData);
        toast({
          title: "Template criado!",
          description: "O novo template está pronto para uso.",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o template. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Template" : "Novo Template"}
          </DialogTitle>
          <DialogDescription>
            Configure um modelo reutilizável para suas propostas
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingTemplate && isEditing ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome do Template *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Casamento Completo"
                  className="glass border-luma-glass-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Validade Padrão (dias)</Label>
                <Input
                  type="number"
                  min="1"
                  value={validDays}
                  onChange={(e) => setValidDays(parseInt(e.target.value) || 30)}
                  className="glass border-luma-glass-border"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva quando usar este template..."
                className="glass border-luma-glass-border min-h-[80px]"
              />
            </div>
            
            {/* Tabs for different sections */}
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="glass border-luma-glass-border w-full justify-start">
                <TabsTrigger value="items" className="gap-2">
                  <Package className="h-4 w-4" />
                  Itens
                </TabsTrigger>
                <TabsTrigger value="contract" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Contrato
                </TabsTrigger>
                <TabsTrigger value="payment" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pagamento
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="items" className="mt-4">
                <ProposalItemsEditor
                  items={items}
                  onChange={setItems}
                  discountAmount={discountAmount}
                  onDiscountChange={setDiscountAmount}
                />
              </TabsContent>
              
              <TabsContent value="contract" className="mt-4">
                <ContractEditor
                  content={contractContent}
                  onChange={setContractContent}
                />
              </TabsContent>
              
              <TabsContent value="payment" className="mt-4">
                <div className="space-y-4">
                  <Label>Configuração de Pagamento Padrão</Label>
                  <PaymentConfigSelector
                    profileId={profileId}
                    selectedConfigId={paymentConfigId}
                    onSelect={setPaymentConfigId}
                  />
                  <p className="text-sm text-muted-foreground">
                    Esta configuração será aplicada automaticamente ao usar este template.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Salvando..." : "Salvar Template"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
