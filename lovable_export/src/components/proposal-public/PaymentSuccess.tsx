import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Upload, 
  Download, 
  Clock, 
  Loader2,
  FileText,
  Sparkles,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUploadReceipt } from "@/hooks/usePublicProposal";
import { PaymentInstructions } from "./PaymentInstructions";

interface PaymentSuccessProps {
  paymentInfo: string | null;
  totalAmount: number;
  token: string;
  contractContent: string;
  clientName: string;
  paymentConfig?: {
    payment_type: string | null;
    pix_key?: string | null;
    pix_key_type?: string | null;
    pix_holder_name?: string | null;
    bank_name?: string | null;
    bank_agency?: string | null;
    bank_account?: string | null;
    account_holder?: string | null;
    account_document?: string | null;
    payment_link_url?: string | null;
    additional_instructions?: string | null;
  } | null;
}

export function PaymentSuccess({ 
  paymentInfo, 
  totalAmount, 
  token,
  contractContent,
  clientName,
  paymentConfig
}: PaymentSuccessProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const uploadReceipt = useUploadReceipt();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        await uploadReceipt.mutateAsync({
          token,
          fileBase64: base64,
          fileName: file.name,
        });
        
        setHasUploaded(true);
        toast({
          title: "Comprovante enviado!",
          description: "O fotógrafo foi notificado sobre o pagamento.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o comprovante. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadContract = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contrato - ${clientName}</title>
          <style>
            body { 
              font-family: Georgia, serif; 
              max-width: 800px; 
              margin: 40px auto; 
              padding: 20px;
              line-height: 1.6;
            }
            pre { 
              white-space: pre-wrap; 
              font-family: inherit; 
            }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <pre>${contractContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const hasPaymentInfo = paymentConfig?.payment_type || paymentInfo;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Success Header with prominent total */}
      <div className="text-center py-4 sm:py-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-500/10 mb-3 sm:mb-4"
        >
          <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" />
        </motion.div>
        
        <h2 className="text-xl sm:text-2xl font-semibold text-editorial-display text-gallery-text mb-1">
          Contrato Assinado!
        </h2>
        <p className="text-sm sm:text-base text-gallery-text-muted mb-4">
          Parabéns, {clientName}!
        </p>
        
        {/* Prominent Total Value */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="py-3 sm:py-4"
        >
          <p className="text-xs sm:text-sm text-gallery-text-muted mb-1">Valor do Contrato</p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gallery-accent text-editorial-display">
            {formatCurrency(totalAmount)}
          </p>
        </motion.div>
      </div>
      
      {/* Next Steps Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="gallery-glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6"
      >
        <h3 className="font-medium text-sm sm:text-base text-gallery-text mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gallery-accent" />
          Próximos Passos
        </h3>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gallery-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-bold text-gallery-accent">1</span>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="font-medium text-sm sm:text-base text-gallery-text">Realize o Pagamento</p>
              <p className="text-xs sm:text-sm text-gallery-text-muted">Use os dados de pagamento abaixo</p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gallery-surface border border-gallery-border flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-medium text-gallery-text-muted">2</span>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="font-medium text-sm sm:text-base text-gallery-text">Envie o Comprovante</p>
              <p className="text-xs sm:text-sm text-gallery-text-muted">Opcional, mas acelera a confirmação</p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gallery-surface border border-gallery-border flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-medium text-gallery-text-muted">3</span>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="font-medium text-sm sm:text-base text-gallery-text">Aguarde a Confirmação</p>
              <p className="text-xs sm:text-sm text-gallery-text-muted">O fotógrafo entrará em contato</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Download Contract - Compact */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="gallery-glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gallery-accent/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gallery-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base text-gallery-text">Sua via do contrato</h3>
            <p className="text-xs sm:text-sm text-gallery-text-muted truncate">
              Guarde uma cópia para seus registros
            </p>
          </div>
          <Button onClick={handleDownloadContract} variant="outline" size="sm" className="gallery-btn-secondary flex-shrink-0">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
        </div>
      </motion.div>
      
      {/* Payment Section */}
      {hasPaymentInfo && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="gallery-glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          <PaymentInstructions
            paymentType={paymentConfig?.payment_type || null}
            pixKey={paymentConfig?.pix_key}
            pixKeyType={paymentConfig?.pix_key_type}
            pixHolderName={paymentConfig?.pix_holder_name}
            bankName={paymentConfig?.bank_name}
            bankAgency={paymentConfig?.bank_agency}
            bankAccount={paymentConfig?.bank_account}
            accountHolder={paymentConfig?.account_holder}
            accountDocument={paymentConfig?.account_document}
            paymentLinkUrl={paymentConfig?.payment_link_url}
            additionalInstructions={paymentConfig?.additional_instructions}
            totalAmount={totalAmount}
            legacyPaymentInfo={paymentInfo}
          />
          
          {/* Upload Receipt */}
          <div className="space-y-3 pt-3 sm:pt-4 border-t border-gallery-border">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {hasUploaded ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600 py-3 sm:py-4">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm sm:text-base">Comprovante enviado com sucesso!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full gallery-btn-primary h-12 sm:h-11 text-sm sm:text-base"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 mr-2" />
                  )}
                  Enviar Comprovante
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full text-gallery-text-muted hover:text-gallery-text h-10 text-sm"
                  onClick={() => {
                    toast({
                      title: "Tudo certo!",
                      description: "O fotógrafo entrará em contato sobre o pagamento.",
                    });
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Pagarei Depois
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Thank you message */}
      <div className="text-center py-4 sm:py-6">
        <p className="text-sm text-gallery-text-muted">
          Obrigado por confiar em nosso trabalho! ✨
        </p>
      </div>
    </motion.div>
  );
}
