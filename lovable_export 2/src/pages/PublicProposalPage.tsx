import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryThemeProvider } from "@/components/gallery-public/GalleryThemeProvider";
import { ProposalHero } from "@/components/proposal-public/ProposalHero";
import { ProposalItemsDisplay } from "@/components/proposal-public/ProposalItemsDisplay";
import { ProposalActions } from "@/components/proposal-public/ProposalActions";
import { ClientDataForm } from "@/components/proposal-public/ClientDataForm";
import { ContractViewer } from "@/components/proposal-public/ContractViewer";
import { SignaturePad } from "@/components/proposal-public/SignaturePad";
import { PaymentSuccess } from "@/components/proposal-public/PaymentSuccess";
import { ProposalLoadingSkeleton } from "@/components/proposal-public/ProposalLoadingSkeleton";
import { ProposalExpiredState } from "@/components/proposal-public/ProposalExpiredState";
import { ProposalChangesRequested } from "@/components/proposal-public/ProposalChangesRequested";
import { ReferencesDisplay } from "@/components/proposal-public/ReferencesDisplay";
import { StepIndicator } from "@/components/proposal-public/StepIndicator";
import { 
  usePublicProposal, 
  useMarkProposalViewed, 
  useApproveProposal,
  useRequestChanges,
  useSignProposal
} from "@/hooks/usePublicProposal";
import { replaceVariables, generateItemsTable } from "@/hooks/useProposalTemplates";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

type FlowStep = "proposal" | "approved" | "form" | "contract" | "signature" | "success";

const isVideoProposal = (type?: string) => type === 'video';

export default function PublicProposalPage() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  
  const { data: proposal, isLoading, error } = usePublicProposal(token);
  const markViewed = useMarkProposalViewed();
  const approveProposal = useApproveProposal();
  const requestChanges = useRequestChanges();
  const signProposal = useSignProposal();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>("proposal");
  const [clientData, setClientData] = useState<Record<string, string>>({});
  const [signedContent, setSignedContent] = useState("");
  const [isAccepted, setIsAccepted] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mark as viewed on mount
  useEffect(() => {
    if (token && proposal && proposal.status === "sent") {
      markViewed.mutate(token);
    }
  }, [token, proposal?.status]);
  
  // Determine initial step based on status
  useEffect(() => {
    if (proposal) {
      switch (proposal.status) {
        case "approved":
          setCurrentStep("form");
          break;
        case "signed":
        case "paid":
          setCurrentStep("success");
          break;
        case "changes_requested":
          setCurrentStep("proposal");
          break;
        default:
          setCurrentStep("proposal");
      }
    }
  }, [proposal?.status]);
  
  const handleApprove = async () => {
    if (!token) return;
    
    try {
      await approveProposal.mutateAsync(token);
      
      // Confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A356', '#D4B76A', '#8B7355'],
      });
      
      setCurrentStep("approved");
      
      // Move to form after animation
      setTimeout(() => {
        setCurrentStep("form");
      }, 2000);
      
    } catch (error) {
      console.error("Erro ao aprovar proposta:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível aprovar a proposta. Tente novamente.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const handleRequestChanges = async (notes: string) => {
    if (!token) return;
    
    try {
      await requestChanges.mutateAsync({ token, notes });
      toast({
        title: "Solicitação enviada!",
        description: "O fotógrafo foi notificado sobre sua solicitação de alteração.",
      });
    } catch (error) {
      console.error("Erro ao solicitar alteração:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível enviar a solicitação. Tente novamente.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const handleClientDataSubmit = (data: Record<string, string>) => {
    setClientData(data);
    
    // Se há arquivo de contrato, usar apenas os dados do cliente
    // Caso contrário, gerar conteúdo assinado com variáveis substituídas
    if (proposal?.contract_file_url) {
      // Para arquivos, apenas armazenar os dados do cliente
      // O conteúdo assinado será gerado na assinatura
      setSignedContent(""); // Será preenchido na assinatura se necessário
    } else {
      // Generate signed content with variables replaced
      const contractTemplate = proposal?.contract_content || `# CONTRATO DE PRESTAÇÃO DE SERVIÇOS

**CONTRATANTE:** ${data.nome_cliente || proposal?.client_name || "Cliente"}

**VALOR TOTAL:** {{valor_total}}

**DATA:** {{data_assinatura}}

Ao assinar, o contratante concorda com os termos da proposta.`;
      
      // Converter items para o formato esperado pela função
      const proposalItems = proposal?.items?.map(item => ({
        name: item.name || item.description || "Item",
        description: item.description,
        details: item.details || "",
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        show_price: item.show_price !== false,
      })) || [];

      const content = replaceVariables(
        contractTemplate, 
        {
          ...data,
          valor_total: formatCurrency(proposal?.total_amount || 0),
          data_assinatura: new Date().toLocaleDateString("pt-BR"),
        },
        proposalItems
      );
      setSignedContent(content);
    }
    
    setCurrentStep("contract");
  };
  
  const handleAcceptContract = () => {
    setIsAccepted(true);
    setCurrentStep("signature");
  };
  
  const handleSign = async (signature: string) => {
    if (!token || !signature) return;
    
    setSignatureBase64(signature);
    setIsSubmitting(true);
    
    try {
      await signProposal.mutateAsync({
        token,
        clientData,
        signedContent,
        signatureBase64: signature,
      });
      
      // Celebrate signing!
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#C5A356', '#D4B76A', '#22C55E', '#10B981'],
      });
      
      setCurrentStep("success");
      
    } catch (error) {
      console.error("Erro ao assinar:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível assinar o contrato. Tente novamente.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <GalleryThemeProvider>
        <ProposalLoadingSkeleton />
      </GalleryThemeProvider>
    );
  }

  if (error || !proposal) {
    return (
      <GalleryThemeProvider>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-editorial-display text-gallery-text mb-2">
              Proposta não encontrada
            </h1>
            <p className="text-gallery-text-muted">
              O link pode estar incorreto ou a proposta foi removida.
            </p>
          </div>
        </div>
      </GalleryThemeProvider>
    );
  }

  if (proposal.is_expired) {
    return (
      <GalleryThemeProvider>
        <ProposalExpiredState 
          title={proposal.title}
          profile={proposal.profile}
        />
      </GalleryThemeProvider>
    );
  }

  // Map flow steps to numeric index for indicator
  const stepToIndex = (step: FlowStep): number => {
    switch (step) {
      case "proposal": return 0;
      case "approved": return 1;
      case "form": return 1;
      case "contract": return 2;
      case "signature": return 3;
      case "success": return 4;
      default: return 0;
    }
  };

  return (
    <GalleryThemeProvider>
      <div className="min-h-screen pb-28 sm:pb-32">
        {/* Hero */}
        <ProposalHero 
          title={proposal.title}
          clientName={proposal.client_name}
          profile={proposal.profile}
          validUntil={proposal.valid_until}
          coverVideoUrl={proposal.cover_video_url}
          revisionLimit={proposal.revision_limit}
          deliveryFormats={proposal.delivery_formats}
          estimatedDurationMin={proposal.estimated_duration_min}
          proposalType={proposal.proposal_type}
        />
        
        {/* Step Indicator - Show after proposal step */}
        {currentStep !== "proposal" && currentStep !== "approved" && (
          <div className="sticky top-0 z-40 bg-gallery-background/80 backdrop-blur-md border-b border-gallery-border">
            <div className="container max-w-4xl mx-auto">
              <StepIndicator 
                currentStep={stepToIndex(currentStep)} 
                totalSteps={5} 
              />
            </div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {/* Step: Proposal View */}
          {currentStep === "proposal" && (
            <motion.div
              key="proposal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container max-w-4xl mx-auto px-4 py-6 sm:py-8"
            >
              {proposal.status === "changes_requested" && (
                <ProposalChangesRequested />
              )}
              
              <ProposalItemsDisplay 
                items={proposal.items}
                totalAmount={proposal.total_amount}
                discountAmount={proposal.discount_amount}
                isVideoProposal={isVideoProposal(proposal.proposal_type)}
              />
              
              {/* References Display - Video proposals only */}
              {isVideoProposal(proposal.proposal_type) && (
                <div className="mt-8">
                  <ReferencesDisplay 
                    referenceLinks={proposal.reference_links}
                    soundtrackLinks={proposal.soundtrack_links}
                  />
                </div>
              )}
            </motion.div>
          )}
          
          {/* Step: Approved Celebration */}
          {currentStep === "approved" && (
            <motion.div
              key="approved"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="container max-w-2xl mx-auto px-4 py-16 text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-semibold text-editorial-display text-gallery-text mb-2">
                Proposta Aprovada!
              </h2>
              <p className="text-gallery-text-muted">
                Vamos preencher alguns dados para finalizar o contrato...
              </p>
            </motion.div>
          )}
          
          {/* Step: Client Data Form */}
          {currentStep === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container max-w-2xl mx-auto px-4 py-4 sm:py-8"
            >
              <ClientDataForm 
                requiredFields={proposal.required_fields}
                initialData={clientData}
                onSubmit={handleClientDataSubmit}
              />
            </motion.div>
          )}
          
          {/* Step: Contract Viewer */}
          {currentStep === "contract" && (
            <motion.div
              key="contract"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container max-w-3xl mx-auto px-4 py-4 sm:py-8"
            >
              <ContractViewer 
                content={signedContent}
                isAccepted={isAccepted}
                onAcceptChange={setIsAccepted}
                onContinue={handleAcceptContract}
              />
            </motion.div>
          )}
          
          {/* Step: Signature */}
          {currentStep === "signature" && (
            <motion.div
              key="signature"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container max-w-2xl mx-auto px-4 py-4 sm:py-8"
            >
              <SignaturePad 
                onSign={handleSign}
                isSubmitting={isSubmitting}
                clientName={clientData.nome_cliente || proposal.client_name || ""}
              />
            </motion.div>
          )}
          
          {/* Step: Success / Payment */}
          {currentStep === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container max-w-2xl mx-auto px-4 py-4 sm:py-8"
            >
              <PaymentSuccess 
                paymentInfo={proposal.payment_info}
                totalAmount={proposal.total_amount}
                token={token!}
                contractContent={signedContent}
                clientName={clientData.nome_cliente || proposal.client_name || ""}
                paymentConfig={proposal.payment_config}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Fixed Actions Bar - Only show on proposal step */}
        {currentStep === "proposal" && proposal.status !== "changes_requested" && (
          <ProposalActions 
            totalAmount={proposal.total_amount}
            onApprove={handleApprove}
            onRequestChanges={handleRequestChanges}
            isApproving={approveProposal.isPending}
          />
        )}
      </div>
    </GalleryThemeProvider>
  );
}
