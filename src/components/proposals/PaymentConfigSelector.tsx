import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Settings, 
  QrCode, 
  Building2, 
  Link as LinkIcon, 
  FileText,
  Star
} from "lucide-react";
import {
  PaymentConfig,
  usePaymentConfigs,
  getPaymentTypeLabel,
} from "@/hooks/usePaymentConfigs";
import { PaymentConfigModal } from "./PaymentConfigModal";

interface PaymentConfigSelectorProps {
  profileId: string;
  selectedConfigId: string | null;
  onSelect: (configId: string | null) => void;
  onConfigsChange?: () => void;
}

const getPaymentTypeIcon = (type: string) => {
  switch (type) {
    case "pix":
      return <QrCode className="h-4 w-4" />;
    case "bank_transfer":
      return <Building2 className="h-4 w-4" />;
    case "payment_link":
      return <LinkIcon className="h-4 w-4" />;
    case "custom":
      return <FileText className="h-4 w-4" />;
    default:
      return null;
  }
};

export function PaymentConfigSelector({
  profileId,
  selectedConfigId,
  onSelect,
  onConfigsChange,
}: PaymentConfigSelectorProps) {
  const { data: configs = [], isLoading } = usePaymentConfigs(profileId);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PaymentConfig | null>(null);

  const selectedConfig = configs.find((c) => c.id === selectedConfigId);

  const handleOpenModal = (config?: PaymentConfig) => {
    setEditingConfig(config || null);
    setShowModal(true);
  };

  const handleCloseModal = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      setEditingConfig(null);
      onConfigsChange?.();
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse h-10 bg-muted rounded-xl" />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select
          value={selectedConfigId || "none"}
          onValueChange={(v) => onSelect(v === "none" ? null : v)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione uma forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">Nenhuma configuração</span>
            </SelectItem>
            {configs.map((config) => (
              <SelectItem key={config.id} value={config.id}>
                <div className="flex items-center gap-2">
                  {getPaymentTypeIcon(config.payment_type)}
                  <span>{config.name}</span>
                  {config.is_default && (
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handleOpenModal()}
          title="Nova configuração"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {selectedConfig && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleOpenModal(selectedConfig)}
            title="Editar configuração"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Preview of selected config */}
      {selectedConfig && (
        <div className="p-4 rounded-xl bg-muted/50 space-y-2">
          <div className="flex items-center gap-2">
            {getPaymentTypeIcon(selectedConfig.payment_type)}
            <span className="font-medium">{getPaymentTypeLabel(selectedConfig.payment_type)}</span>
            {selectedConfig.is_default && (
              <Badge variant="secondary" className="text-xs">Padrão</Badge>
            )}
          </div>
          
          {selectedConfig.payment_type === "pix" && selectedConfig.pix_key && (
            <div className="text-sm text-muted-foreground">
              <p>Chave: {selectedConfig.pix_key}</p>
              {selectedConfig.pix_holder_name && (
                <p>Titular: {selectedConfig.pix_holder_name}</p>
              )}
            </div>
          )}
          
          {selectedConfig.payment_type === "bank_transfer" && (
            <div className="text-sm text-muted-foreground">
              <p>{selectedConfig.bank_name} - Ag: {selectedConfig.bank_agency} / Cc: {selectedConfig.bank_account}</p>
              {selectedConfig.account_holder && (
                <p>Titular: {selectedConfig.account_holder}</p>
              )}
            </div>
          )}
          
          {selectedConfig.payment_type === "payment_link" && selectedConfig.payment_link_url && (
            <p className="text-sm text-muted-foreground truncate">
              {selectedConfig.payment_link_url}
            </p>
          )}
          
          {selectedConfig.additional_instructions && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {selectedConfig.additional_instructions}
            </p>
          )}
        </div>
      )}

      {configs.length === 0 && (
        <div className="p-4 rounded-xl border border-dashed text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Nenhuma configuração de pagamento cadastrada.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Configuração
          </Button>
        </div>
      )}

      <PaymentConfigModal
        open={showModal}
        onOpenChange={handleCloseModal}
        profileId={profileId}
        editingConfig={editingConfig}
      />
    </div>
  );
}
