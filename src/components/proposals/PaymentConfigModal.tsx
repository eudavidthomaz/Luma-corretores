import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  CreditCard, 
  Building2, 
  Link as LinkIcon, 
  FileText,
  QrCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  PaymentConfig,
  PaymentConfigInsert,
  PaymentType,
  PixKeyType,
  useCreatePaymentConfig,
  useUpdatePaymentConfig,
  getPaymentTypeLabel,
  getPixKeyTypeLabel,
} from "@/hooks/usePaymentConfigs";

interface PaymentConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  editingConfig?: PaymentConfig | null;
}

const paymentTypes: { value: PaymentType; label: string; icon: React.ReactNode }[] = [
  { value: "pix", label: "PIX", icon: <QrCode className="h-4 w-4" /> },
  { value: "bank_transfer", label: "Transferência Bancária", icon: <Building2 className="h-4 w-4" /> },
  { value: "payment_link", label: "Link de Pagamento", icon: <LinkIcon className="h-4 w-4" /> },
  { value: "custom", label: "Instruções Personalizadas", icon: <FileText className="h-4 w-4" /> },
];

const pixKeyTypes: { value: PixKeyType; label: string }[] = [
  { value: "email", label: "E-mail" },
  { value: "phone", label: "Telefone" },
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "random", label: "Chave Aleatória" },
];

export function PaymentConfigModal({
  open,
  onOpenChange,
  profileId,
  editingConfig,
}: PaymentConfigModalProps) {
  const { toast } = useToast();
  const createConfig = useCreatePaymentConfig();
  const updateConfig = useUpdatePaymentConfig();

  const [name, setName] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("pix");
  const [isDefault, setIsDefault] = useState(false);
  
  // PIX fields
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("email");
  const [pixHolderName, setPixHolderName] = useState("");
  
  // Bank transfer fields
  const [bankName, setBankName] = useState("");
  const [bankAgency, setBankAgency] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountDocument, setAccountDocument] = useState("");
  
  // Payment link
  const [paymentLinkUrl, setPaymentLinkUrl] = useState("");
  
  // Additional instructions
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const isEditing = !!editingConfig;
  const isLoading = createConfig.isPending || updateConfig.isPending;

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (open && editingConfig) {
      setName(editingConfig.name);
      setPaymentType(editingConfig.payment_type);
      setIsDefault(editingConfig.is_default);
      setPixKey(editingConfig.pix_key || "");
      setPixKeyType(editingConfig.pix_key_type || "email");
      setPixHolderName(editingConfig.pix_holder_name || "");
      setBankName(editingConfig.bank_name || "");
      setBankAgency(editingConfig.bank_agency || "");
      setBankAccount(editingConfig.bank_account || "");
      setAccountHolder(editingConfig.account_holder || "");
      setAccountDocument(editingConfig.account_document || "");
      setPaymentLinkUrl(editingConfig.payment_link_url || "");
      setAdditionalInstructions(editingConfig.additional_instructions || "");
    } else if (open) {
      // Reset to defaults for new config
      setName("");
      setPaymentType("pix");
      setIsDefault(false);
      setPixKey("");
      setPixKeyType("email");
      setPixHolderName("");
      setBankName("");
      setBankAgency("");
      setBankAccount("");
      setAccountHolder("");
      setAccountDocument("");
      setPaymentLinkUrl("");
      setAdditionalInstructions("");
    }
  }, [open, editingConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Dê um nome para identificar esta configuração.",
        variant: "destructive",
      });
      return;
    }

    const configData: PaymentConfigInsert = {
      profile_id: profileId,
      name: name.trim(),
      payment_type: paymentType,
      is_default: isDefault,
      pix_key: paymentType === "pix" ? pixKey || null : null,
      pix_key_type: paymentType === "pix" ? pixKeyType : null,
      pix_holder_name: paymentType === "pix" ? pixHolderName || null : null,
      bank_name: paymentType === "bank_transfer" ? bankName || null : null,
      bank_agency: paymentType === "bank_transfer" ? bankAgency || null : null,
      bank_account: paymentType === "bank_transfer" ? bankAccount || null : null,
      account_holder: paymentType === "bank_transfer" ? accountHolder || null : null,
      account_document: paymentType === "bank_transfer" ? accountDocument || null : null,
      payment_link_url: paymentType === "payment_link" ? paymentLinkUrl || null : null,
      additional_instructions: additionalInstructions || null,
    };

    try {
      if (isEditing) {
        await updateConfig.mutateAsync({ id: editingConfig.id, ...configData });
        toast({
          title: "Configuração atualizada!",
          description: "As alterações foram salvas.",
        });
      } else {
        await createConfig.mutateAsync(configData);
        toast({
          title: "Configuração criada!",
          description: "A nova forma de pagamento foi salva.",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Configuração" : "Nova Configuração de Pagamento"}
          </DialogTitle>
          <DialogDescription>
            Configure como você deseja receber pagamentos dos clientes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="config-name">Nome da Configuração</Label>
            <Input
              id="config-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: PIX Nubank, Conta Empresa..."
            />
          </div>

          {/* Payment Type */}
          <div className="space-y-2">
            <Label>Tipo de Pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              {paymentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPaymentType(type.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                    paymentType === type.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {type.icon}
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Fields based on payment type */}
          <AnimatePresence mode="wait">
            <motion.div
              key={paymentType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {paymentType === "pix" && (
                <>
                  <div className="space-y-2">
                    <Label>Tipo de Chave PIX</Label>
                    <Select value={pixKeyType} onValueChange={(v) => setPixKeyType(v as PixKeyType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {pixKeyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pix-key">Chave PIX</Label>
                    <Input
                      id="pix-key"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder={
                        pixKeyType === "email" ? "seu@email.com" :
                        pixKeyType === "phone" ? "+5511999999999" :
                        pixKeyType === "cpf" ? "000.000.000-00" :
                        pixKeyType === "cnpj" ? "00.000.000/0000-00" :
                        "Chave aleatória"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pix-holder">Nome do Titular</Label>
                    <Input
                      id="pix-holder"
                      value={pixHolderName}
                      onChange={(e) => setPixHolderName(e.target.value)}
                      placeholder="João da Silva"
                    />
                  </div>
                </>
              )}

              {paymentType === "bank_transfer" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Banco</Label>
                      <Input
                        id="bank-name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Nubank, Itaú..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank-agency">Agência</Label>
                      <Input
                        id="bank-agency"
                        value={bankAgency}
                        onChange={(e) => setBankAgency(e.target.value)}
                        placeholder="0001"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank-account">Conta</Label>
                    <Input
                      id="bank-account"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="12345-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-holder">Titular da Conta</Label>
                    <Input
                      id="account-holder"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-document">CPF/CNPJ do Titular</Label>
                    <Input
                      id="account-document"
                      value={accountDocument}
                      onChange={(e) => setAccountDocument(e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </>
              )}

              {paymentType === "payment_link" && (
                <div className="space-y-2">
                  <Label htmlFor="payment-link">URL do Link de Pagamento</Label>
                  <Input
                    id="payment-link"
                    type="url"
                    value={paymentLinkUrl}
                    onChange={(e) => setPaymentLinkUrl(e.target.value)}
                    placeholder="https://pay.stripe.com/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole aqui o link do Stripe, PagSeguro, Mercado Pago, etc.
                  </p>
                </div>
              )}

              {paymentType === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-instructions">Instruções de Pagamento</Label>
                  <Textarea
                    id="custom-instructions"
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="Descreva como o cliente deve realizar o pagamento..."
                    rows={5}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Additional Instructions (for non-custom types) */}
          {paymentType !== "custom" && (
            <div className="space-y-2">
              <Label htmlFor="additional">Instruções Adicionais (opcional)</Label>
              <Textarea
                id="additional"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="Informações extras para o cliente..."
                rows={3}
              />
            </div>
          )}

          {/* Set as default */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div>
              <p className="font-medium text-sm">Usar como padrão</p>
              <p className="text-xs text-muted-foreground">
                Esta configuração será selecionada automaticamente em novas propostas.
              </p>
            </div>
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Criar Configuração"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
