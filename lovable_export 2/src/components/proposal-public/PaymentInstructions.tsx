import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  Check, 
  QrCode, 
  Building2, 
  ExternalLink, 
  CreditCard,
  User,
  Hash
} from "lucide-react";

interface PaymentInstructionsProps {
  paymentType: string | null;
  pixKey?: string | null;
  pixKeyType?: string | null;
  pixHolderName?: string | null;
  bankName?: string | null;
  bankAgency?: string | null;
  bankAccount?: string | null;
  accountHolder?: string | null;
  accountDocument?: string | null;
  paymentLinkUrl?: string | null;
  additionalInstructions?: string | null;
  totalAmount: number;
  // Fallback for legacy payment_info text
  legacyPaymentInfo?: string | null;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: `${label} copiado para a área de transferência.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleCopy}
      className="h-7 w-7 text-gallery-text-muted hover:text-gallery-accent"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

function DataRow({ 
  icon: Icon, 
  label, 
  value, 
  copyable = true 
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gallery-border last:border-0">
      <div className="flex items-center gap-2 text-gallery-text-muted">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-gallery-text">{value}</span>
        {copyable && <CopyButton text={value} label={label} />}
      </div>
    </div>
  );
}

export function PaymentInstructions({
  paymentType,
  pixKey,
  pixKeyType,
  pixHolderName,
  bankName,
  bankAgency,
  bankAccount,
  accountHolder,
  accountDocument,
  paymentLinkUrl,
  additionalInstructions,
  totalAmount,
  legacyPaymentInfo,
}: PaymentInstructionsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPixKeyTypeLabel = (type: string | null) => {
    switch (type) {
      case "cpf": return "CPF";
      case "cnpj": return "CNPJ";
      case "email": return "E-mail";
      case "phone": return "Telefone";
      case "random": return "Chave Aleatória";
      default: return "Chave PIX";
    }
  };

  // If no structured payment config, show legacy text
  if (!paymentType && legacyPaymentInfo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-gallery-accent" />
          <h3 className="font-semibold text-gallery-text text-lg">Pagamento</h3>
        </div>
        
        <div className="text-center py-4">
          <p className="text-sm text-gallery-text-muted mb-1">Valor Total</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-3xl font-bold text-gallery-accent">
              {formatCurrency(totalAmount)}
            </p>
            <CopyButton text={formatCurrency(totalAmount)} label="Valor" />
          </div>
        </div>

        <div className="bg-gallery-surface rounded-xl p-4">
          <pre className="whitespace-pre-wrap text-sm text-gallery-text font-sans">
            {legacyPaymentInfo}
          </pre>
        </div>
      </div>
    );
  }

  // No payment info at all
  if (!paymentType) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-gallery-accent" />
        <h3 className="font-semibold text-gallery-text text-lg">Pagamento</h3>
      </div>

      {/* Total Amount */}
      <div className="text-center py-4 bg-gallery-surface rounded-xl">
        <p className="text-sm text-gallery-text-muted mb-1">Valor Total</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-3xl font-bold text-gallery-accent">
            {formatCurrency(totalAmount)}
          </p>
          <CopyButton text={totalAmount.toFixed(2)} label="Valor" />
        </div>
      </div>

      {/* PIX Payment */}
      {paymentType === "pix" && pixKey && (
        <div className="gallery-glass-card rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="h-5 w-5 text-gallery-accent" />
            <span className="font-medium text-gallery-text">Pague via PIX</span>
          </div>
          
          <DataRow
            icon={Hash}
            label={getPixKeyTypeLabel(pixKeyType)}
            value={pixKey}
          />
          
          {pixHolderName && (
            <DataRow
              icon={User}
              label="Titular"
              value={pixHolderName}
              copyable={false}
            />
          )}
        </div>
      )}

      {/* Bank Transfer */}
      {paymentType === "bank_transfer" && (
        <div className="gallery-glass-card rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-gallery-accent" />
            <span className="font-medium text-gallery-text">Transferência Bancária</span>
          </div>
          
          {bankName && (
            <DataRow
              icon={Building2}
              label="Banco"
              value={bankName}
              copyable={false}
            />
          )}
          
          {bankAgency && (
            <DataRow
              icon={Hash}
              label="Agência"
              value={bankAgency}
            />
          )}
          
          {bankAccount && (
            <DataRow
              icon={Hash}
              label="Conta"
              value={bankAccount}
            />
          )}
          
          {accountHolder && (
            <DataRow
              icon={User}
              label="Titular"
              value={accountHolder}
              copyable={false}
            />
          )}
          
          {accountDocument && (
            <DataRow
              icon={Hash}
              label="CPF/CNPJ"
              value={accountDocument}
            />
          )}
        </div>
      )}

      {/* Payment Link */}
      {paymentType === "payment_link" && paymentLinkUrl && (
        <div className="gallery-glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="h-5 w-5 text-gallery-accent" />
            <span className="font-medium text-gallery-text">Link de Pagamento</span>
          </div>
          
          <Button
            asChild
            className="w-full gallery-btn-primary"
          >
            <a href={paymentLinkUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Link de Pagamento
            </a>
          </Button>
        </div>
      )}

      {/* Custom/Additional Instructions */}
      {additionalInstructions && (
        <div className="bg-gallery-surface rounded-xl p-4">
          <p className="text-sm text-gallery-text-muted mb-2">Instruções:</p>
          <pre className="whitespace-pre-wrap text-sm text-gallery-text font-sans">
            {additionalInstructions}
          </pre>
        </div>
      )}
    </motion.div>
  );
}
