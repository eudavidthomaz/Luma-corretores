import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Copy, 
  User, 
  Package, 
  FileText, 
  CreditCard,
  Settings,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Eye,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads } from "@/hooks/useLeads";
import { 
  useProposal, 
  useCreateProposal, 
  useUpdateProposal,
  useAddProposalItem,
  useUpdateProposalItem,
  useDeleteProposalItem,
  useRecalculateProposalTotal 
} from "@/hooks/useProposals";
import { 
  useProposalTemplates,
  useCreateProposalTemplate,
  defaultContractVariables,
  extractVariablesFromContent,
  templateItemsToEditorItems
} from "@/hooks/useProposalTemplates";
import { useDefaultPaymentConfig } from "@/hooks/usePaymentConfigs";
import { ProposalItemsEditor } from "@/components/proposals/ProposalItemsEditor";
import { ContractEditor } from "@/components/proposals/ContractEditor";
import { PaymentConfigSelector } from "@/components/proposals/PaymentConfigSelector";
import { TemplateSelectorCard } from "@/components/proposals/TemplateSelectorCard";
import { ProposalTypeSelector, type ProposalType } from "@/components/proposals/ProposalTypeSelector";
import { VideoHeroInput } from "@/components/proposals/VideoHeroInput";
import { VideoConfigFields } from "@/components/proposals/VideoConfigFields";
import { ReferencesEditor, type ReferenceLink, type SoundtrackLink } from "@/components/proposals/ReferencesEditor";
import { Tables } from "@/integrations/supabase/types";
import { DEFAULT_VIDEO_CONTRACT, DEFAULT_VIDEO_ITEMS } from "@/lib/contractTemplates";

interface ProposalItem {
  id?: string;
  name: string;           // Nome curto do item
  description?: string;   // Mantido para compatibilidade
  details?: string;       // Descrição longa
  quantity: number;
  unit_price: number;
  show_price: boolean;    // Se deve exibir o preço
  order_index: number;
}

export default function EditProposalPage() {
  const { id: rawId } = useParams();
  const [searchParams] = useSearchParams();
  const leadIdFromUrl = searchParams.get("leadId");
  // "new" significa nova proposta, qualquer outro valor é um ID existente
  const isNew = rawId === "new" || !rawId;
  const id = isNew ? undefined : rawId;
  const navigate = useNavigate();
  const { profile, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  // Queries
  const { data: proposal, isLoading: isLoadingProposal } = useProposal(isNew ? undefined : id);
  const { data: leads } = useLeads(profile?.id);
  const { data: templates } = useProposalTemplates(profile?.id);
  
  // Mutations
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();
  const addProposalItem = useAddProposalItem();
  const updateProposalItem = useUpdateProposalItem();
  const deleteProposalItem = useDeleteProposalItem();
  const recalculateTotal = useRecalculateProposalTotal();
  const createTemplate = useCreateProposalTemplate();
  
  // Default payment config
  const { data: defaultPaymentConfig } = useDefaultPaymentConfig(profile?.id);
  
  // Form state
  const [title, setTitle] = useState("");
  const [leadId, setLeadId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [contractContent, setContractContent] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [paymentConfigId, setPaymentConfigId] = useState<string | null>(null);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [useManualTotal, setUseManualTotal] = useState(false);
  const [manualTotalAmount, setManualTotalAmount] = useState(0);
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [activeTab, setActiveTab] = useState("client");
  const [isSaving, setIsSaving] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [templateApplied, setTemplateApplied] = useState(false);
  
  // Video proposal fields
  const [proposalType, setProposalType] = useState<ProposalType>("photo");
  const [coverVideoUrl, setCoverVideoUrl] = useState("");
  const [revisionLimit, setRevisionLimit] = useState(3);
  const [deliveryFormats, setDeliveryFormats] = useState<string[]>([]);
  const [estimatedDurationMin, setEstimatedDurationMin] = useState<number | null>(null);
  const [projectFormat, setProjectFormat] = useState("");
  const [referenceLinks, setReferenceLinks] = useState<ReferenceLink[]>([]);
  const [soundtrackLinks, setSoundtrackLinks] = useState<SoundtrackLink[]>([]);
  
  // Load proposal data
  useEffect(() => {
    if (proposal) {
      const proposalAny = proposal as unknown as Record<string, unknown>;
      setTitle(proposal.title || "");
      setLeadId(proposal.lead_id || "");
      setClientName(proposal.client_name || "");
      setClientEmail(proposal.client_email || "");
      setValidUntil(proposal.valid_until || "");
      setContractContent(proposal.contract_content || "");
      setPaymentInfo(proposal.payment_info || "");
      setPaymentConfigId((proposalAny.payment_config_id as string | null) || null);
      setUseManualTotal((proposalAny.use_manual_total as boolean) || false);
      if (proposalAny.use_manual_total) {
        setManualTotalAmount(Number(proposal.total_amount) || 0);
      }
      setRequiredFields(proposal.required_fields || []);
      setDiscountAmount(Number(proposal.discount_amount) || 0);
      
      // Video-specific fields
      setProposalType((proposalAny.proposal_type as ProposalType) || "photo");
      setCoverVideoUrl((proposalAny.cover_video_url as string) || "");
      setRevisionLimit((proposalAny.revision_limit as number) || 3);
      setDeliveryFormats((proposalAny.delivery_formats as string[]) || []);
      setEstimatedDurationMin((proposalAny.estimated_duration_min as number) || null);
      setProjectFormat((proposalAny.project_format as string) || "");
      setReferenceLinks((proposalAny.reference_links as ReferenceLink[]) || []);
      setSoundtrackLinks((proposalAny.soundtrack_links as SoundtrackLink[]) || []);
      
      setItems(proposal.proposal_items?.map((item, index) => ({
        id: item.id,
        name: (item as any).name || item.description || "",
        description: item.description || "",
        details: (item as any).details || "",
        quantity: item.quantity || 1,
        unit_price: Number(item.unit_price) || 0,
        show_price: (item as any).show_price !== false,
        order_index: item.order_index ?? index,
      })) || []);
    }
  }, [proposal]);
  
  // Set default payment config for new proposals
  useEffect(() => {
    if (isNew && defaultPaymentConfig && !paymentConfigId) {
      setPaymentConfigId(defaultPaymentConfig.id);
    }
  }, [isNew, defaultPaymentConfig, paymentConfigId]);
  
  // Pre-fill from URL leadId parameter (for new proposals)
  useEffect(() => {
    if (isNew && leadIdFromUrl && leads) {
      const lead = leads.find(l => l.id === leadIdFromUrl);
      if (lead) {
        setLeadId(leadIdFromUrl);
        setClientName(lead.name || "");
        setClientEmail(lead.email || "");
      }
    }
  }, [isNew, leadIdFromUrl, leads]);
  
  // Auto-fill client data when lead is selected manually
  useEffect(() => {
    // Skip if we already set from URL param
    if (isNew && leadIdFromUrl && leadId === leadIdFromUrl) return;
    
    if (leadId && leads) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setClientName(lead.name || "");
        setClientEmail(lead.email || "");
      }
    }
  }, [leadId, leads, isNew, leadIdFromUrl]);
  
  // Extract required fields from contract content
  useEffect(() => {
    if (contractContent) {
      const variables = extractVariablesFromContent(contractContent);
      setRequiredFields(variables);
    }
  }, [contractContent]);
  
  // Handle proposal type change
  const handleProposalTypeChange = (newType: ProposalType) => {
    const previousType = proposalType;
    setProposalType(newType);
    
    // Show toast when switching to video
    if (newType === 'video' && previousType === 'photo') {
      toast({
        title: "🎬 Modo Vídeo Ativado",
        description: "Campos de revisão, formato e duração habilitados. Template de contrato de vídeo disponível.",
      });
      
      // Auto-fill video contract if contract is empty or default
      if (!contractContent.trim() || contractContent.length < 100) {
        setContractContent(DEFAULT_VIDEO_CONTRACT);
      }
      
      // Auto-fill video items if items are empty
      if (items.length === 0) {
        const videoItems = DEFAULT_VIDEO_ITEMS.map((item, idx) => ({
          ...item,
          order_index: idx,
        }));
        setItems(videoItems);
      }
      
      // Set default delivery formats
      if (deliveryFormats.length === 0) {
        setDeliveryFormats(["16:9"]);
      }
    } else if (newType === 'photo' && previousType === 'video') {
      toast({
        title: "📸 Modo Fotografia Ativado",
        description: "Campos padrão de fotografia restaurados.",
      });
    }
  };
  
  // Calculate total
  const calculateTotal = () => {
    if (useManualTotal) {
      return manualTotalAmount - discountAmount;
    }
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    return subtotal - discountAmount;
  };
  
  const handleSave = async (shouldSend = false) => {
    console.log("🚀 ===== INÍCIO handleSave =====");
    console.log("📋 shouldSend:", shouldSend);
    console.log("📋 isNew:", isNew);
    console.log("📋 profile?.id:", profile?.id);
    
    // Validação de autenticação
    console.log("🔍 [STEP 1] Verificando autenticação...");
    if (!profile?.id) {
      console.error("❌ FALHA: profile.id não existe!", { profile });
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar propostas. Por favor, faça login novamente.",
        variant: "destructive",
        duration: 10000,
      });
      alert("ERRO: Você precisa estar logado para salvar propostas.");
      return;
    }
    console.log("✅ [STEP 1] Autenticação OK - profile_id:", profile.id);
    
    // Validação de título
    console.log("🔍 [STEP 2] Verificando título...");
    console.log("   Título atual:", JSON.stringify(title));
    if (!title.trim()) {
      console.error("❌ FALHA: Título vazio!");
      setTitleError(true);
      setActiveTab("client");
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para a proposta.",
        variant: "destructive",
        duration: 10000,
      });
      alert("ERRO: Título é obrigatório!");
      return;
    }
    setTitleError(false);
    console.log("✅ [STEP 2] Título OK:", title);
    
    // Validação de contrato - apenas se for enviar
    console.log("🔍 [STEP 3] Verificando contrato (se shouldSend)...");
    console.log("   contractContent length:", contractContent?.length || 0);
    if (shouldSend && !contractContent.trim()) {
      console.error("❌ FALHA: Contrato obrigatório para envio!");
      toast({
        title: "Contrato obrigatório",
        description: "Por favor, adicione o texto do contrato antes de enviar.",
        variant: "destructive",
        duration: 10000,
      });
      alert("ERRO: Contrato é obrigatório para enviar!");
      setActiveTab("contract");
      return;
    }
    console.log("✅ [STEP 3] Contrato OK (ou não obrigatório)");
    
    // Validação de valor - apenas se for enviar
    console.log("🔍 [STEP 4] Verificando valor (se shouldSend)...");
    console.log("   useManualTotal:", useManualTotal);
    console.log("   manualTotalAmount:", manualTotalAmount);
    console.log("   items.length:", items.length);
    if (shouldSend && !useManualTotal && items.length === 0) {
      console.error("❌ FALHA: Defina um valor ou adicione itens!");
      toast({
        title: "Valor obrigatório",
        description: "Defina um valor manual ou adicione itens à proposta.",
        variant: "destructive",
        duration: 10000,
      });
      setActiveTab("items");
      return;
    }
    if (shouldSend && useManualTotal && manualTotalAmount <= 0) {
      console.error("❌ FALHA: Valor manual deve ser maior que zero!");
      toast({
        title: "Valor inválido",
        description: "O valor total deve ser maior que zero.",
        variant: "destructive",
        duration: 10000,
      });
      setActiveTab("items");
      return;
    }
    console.log("✅ [STEP 4] Valor OK");
    
    // Validação de email (se fornecido)
    console.log("🔍 [STEP 5] Verificando email...");
    console.log("   clientEmail:", clientEmail);
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      console.error("❌ FALHA: Email inválido!");
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
        duration: 10000,
      });
      alert("ERRO: Email inválido!");
      setActiveTab("client");
      return;
    }
    console.log("✅ [STEP 5] Email OK");
    
    console.log("🔍 [STEP 6] Todas validações passaram! Iniciando salvamento...");
    setIsSaving(true);
    
    try {
      console.log("🔍 [STEP 7] Montando proposalData...");
      const proposalData = {
        profile_id: profile.id,
        title: title.trim(),
        lead_id: leadId || null,
        client_name: clientName?.trim() || null,
        client_email: clientEmail?.trim() || null,
        valid_until: validUntil || null,
        contract_content: contractContent.trim() || null,
        payment_info: paymentInfo?.trim() || null,
        payment_config_id: paymentConfigId || null,
        use_manual_total: useManualTotal,
        required_fields: requiredFields,
        discount_amount: discountAmount,
        total_amount: calculateTotal(),
        status: shouldSend ? "sent" as const : "draft" as const,
        sent_at: shouldSend ? new Date().toISOString() : null,
        // Video-specific fields
        proposal_type: proposalType,
        cover_video_url: coverVideoUrl?.trim() || null,
        revision_limit: revisionLimit,
        delivery_formats: deliveryFormats,
        estimated_duration_min: estimatedDurationMin,
        project_format: projectFormat?.trim() || null,
        reference_links: referenceLinks as unknown as null,
        soundtrack_links: soundtrackLinks as unknown as null,
      } as any;
      
      console.log("✅ [STEP 7] proposalData montado:", JSON.stringify(proposalData, null, 2));
      
      let proposalId: string | undefined = isNew ? undefined : id;
      
      if (isNew) {
        console.log("🔍 [STEP 8] Criando NOVA proposta...");
        console.log("   Chamando createProposal.mutateAsync...");
        
        const newProposal = await createProposal.mutateAsync(proposalData);
        
        console.log("✅ [STEP 8] createProposal.mutateAsync RETORNOU:", newProposal);
        
        if (!newProposal?.id) {
          console.error("❌ FALHA: Proposta criada mas ID não retornado!", newProposal);
          throw new Error("Proposta criada mas ID não retornado");
        }
        
        console.log("✅ Proposta criada com sucesso:", {
          id: newProposal.id,
          public_token: newProposal.public_token,
          status: newProposal.status,
        });
        
        proposalId = newProposal.id;
        
        // Criar itens - SEM throw se não houver itens válidos
        console.log("🔍 [STEP 9] Processando itens...");
        console.log("   items.length:", items.length);
        
        if (items.length > 0) {
          const validItems = items.filter(item => {
            const name = item.name?.trim();
            return name && name.length > 0;
          });
          
          console.log("   validItems.length:", validItems.length);
          
          // NÃO dar throw - simplesmente não criar itens se não houver válidos
          if (validItems.length > 0) {
            console.log("   Criando", validItems.length, "itens...");
            const itemPromises = validItems.map((item, index) => 
              addProposalItem.mutateAsync({
                proposal_id: proposalId,
                description: (item.name || "").trim(),
                name: (item.name || "").trim(),
                details: item.details || null,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0,
                show_price: item.show_price !== false,
                order_index: item.order_index ?? index,
                category: (item as any).category || null,
              } as any)
            );
            
            await Promise.all(itemPromises);
            console.log("✅ [STEP 9] Itens criados com sucesso!");
          } else {
            console.log("⚠️ [STEP 9] Nenhum item válido para criar (OK para rascunho)");
          }
        } else {
          console.log("⚠️ [STEP 9] Nenhum item para criar");
        }
      } else if (proposalId) {
        console.log("🔍 [STEP 8] Atualizando proposta existente...");
        console.log("   proposalId:", proposalId);
        
        await updateProposal.mutateAsync({ id: proposalId, ...proposalData });
        console.log("✅ [STEP 8] Proposta atualizada!");
        
        // Atualizar itens: deletar todos existentes e recriar
        const existingItems = proposal?.proposal_items || [];
        console.log("🔍 [STEP 9] Atualizando itens...");
        console.log("   existingItems.length:", existingItems.length);
        
        // Deletar itens existentes
        if (existingItems.length > 0) {
          console.log("   Deletando itens existentes...");
          const deletePromises = existingItems.map(existing => 
            deleteProposalItem.mutateAsync({ 
              id: existing.id, 
              proposal_id: proposalId 
            })
          );
          await Promise.all(deletePromises);
          console.log("   Itens antigos deletados!");
        }
        
        // Criar novos itens - SEM throw se não houver válidos
        if (items.length > 0) {
          const validItems = items.filter(item => {
            const name = item.name?.trim();
            return name && name.length > 0;
          });
          
          console.log("   validItems.length:", validItems.length);
          
          if (validItems.length > 0) {
            console.log("   Criando", validItems.length, "novos itens...");
            const itemPromises = validItems.map((item, index) => 
              addProposalItem.mutateAsync({
                proposal_id: proposalId,
                description: (item.name || "").trim(),
                name: (item.name || "").trim(),
                details: item.details || null,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0,
                show_price: item.show_price !== false,
                order_index: item.order_index ?? index,
                category: (item as any).category || null,
              } as any)
            );
            await Promise.all(itemPromises);
            console.log("✅ [STEP 9] Novos itens criados!");
          } else {
            console.log("⚠️ [STEP 9] Nenhum item válido para criar");
          }
        }
      }
      
      console.log("🎉 ===== SALVAMENTO COMPLETO! =====");
      console.log("   proposalId:", proposalId);
      
      toast({
        title: shouldSend ? "Proposta enviada!" : "Proposta salva!",
        description: shouldSend 
          ? "O link da proposta está pronto para ser compartilhado."
          : "Suas alterações foram salvas.",
        duration: 5000,
      });
      
      if (isNew && proposalId) {
        console.log("🔄 Navegando para página de edição:", `/admin/proposals/${proposalId}`);
        navigate(`/admin/proposals/${proposalId}`);
      }
    } catch (error: unknown) {
      // Log completo do erro
      console.error("❌ ===== ERRO NO handleSave =====");
      console.error("❌ ERRO COMPLETO:", error);
      console.error("❌ TIPO:", typeof error);
      console.error("❌ STACK:", error instanceof Error ? error.stack : "N/A");
      
      // Extrair detalhes do erro
      let errorMessage = "Erro desconhecido ao salvar a proposta";
      let errorDetails = "";
      
      if (error && typeof error === 'object') {
        const err = error as Record<string, unknown>;
        console.error("❌ Objeto de erro:", JSON.stringify(err, null, 2));
        errorMessage = (err.message as string) || errorMessage;
        errorDetails = (err.details as string) || (err.hint as string) || "";
        
        // Mensagens mais amigáveis para erros comuns
        if (err.code === "23505") {
          errorMessage = "Erro: Já existe uma proposta com esses dados";
        } else if (err.code === "23503") {
          errorMessage = "Erro: Referência inválida (lead ou perfil não encontrado)";
        } else if (err.code === "42501") {
          errorMessage = "Erro de permissão: Você não tem permissão para realizar esta ação";
        }
      }
      
      console.error("❌ Mensagem final:", errorMessage);
      console.error("❌ Detalhes:", errorDetails);
      
      // Toast com duração longa
      toast({
        title: "❌ Erro ao salvar proposta",
        description: errorDetails ? `${errorMessage}\n${errorDetails}` : errorMessage,
        variant: "destructive",
        duration: 10000, // 10 segundos
      });
      
      // Alert de backup - GARANTE que o usuário vê o erro
      alert(`ERRO AO SALVAR PROPOSTA:\n\n${errorMessage}${errorDetails ? `\n\nDetalhes: ${errorDetails}` : ''}`);
    } finally {
      console.log("🏁 ===== FIM handleSave (finally) =====");
      setIsSaving(false);
    }
  };
  
  const handleCopyLink = () => {
    if (proposal?.public_token) {
      const url = `${window.location.origin}/proposta/${proposal.public_token}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link da proposta foi copiado para a área de transferência.",
      });
    }
  };
  
  // Apply a template to the current proposal
  const handleApplyTemplate = (template: Tables<"proposal_templates">) => {
    // Set contract content
    if (template.content) {
      setContractContent(template.content);
    }
    
    // Set payment config
    if (template.default_payment_config_id) {
      setPaymentConfigId(template.default_payment_config_id);
    }
    
    // Set validity
    if (template.default_valid_days) {
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + template.default_valid_days);
      setValidUntil(validDate.toISOString().split("T")[0]);
    }
    
    // Set items
    const templateItems = template.default_items as unknown[];
    if (Array.isArray(templateItems) && templateItems.length > 0) {
      const convertedItems = templateItemsToEditorItems(templateItems).map((item, idx) => ({
        ...item,
        order_index: idx,
      }));
      setItems(convertedItems);
    }
    
    setTemplateApplied(true);
    toast({
      title: "Template aplicado!",
      description: `O template "${template.title}" foi carregado com sucesso.`,
    });
  };
  
  // Save current proposal as a template
  const handleSaveAsTemplate = async () => {
    if (!profile?.id) return;
    
    const templateName = title.trim() || "Novo Template";
    
    try {
      await createTemplate.mutateAsync({
        profile_id: profile.id,
        title: templateName,
        description: "",
        content: contractContent.trim() || "",
        default_items: items.map((item, index) => ({
          name: item.name,
          details: item.details || "",
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          show_price: item.show_price !== false,
          order_index: index,
        })),
        default_payment_config_id: paymentConfigId,
        default_valid_days: validUntil 
          ? Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 30,
      });
      
      toast({
        title: "Template salvo!",
        description: "A proposta foi salva como um novo template.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar template",
        description: "Não foi possível salvar o template.",
        variant: "destructive",
      });
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isAuthLoading || (!isNew && isLoadingProposal)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        <Button onClick={() => navigate("/auth")}>Fazer Login</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/proposals")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? "Nova Proposta" : "Editar Proposta"}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? "Crie uma nova proposta comercial" : title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isNew && proposal?.public_token && proposal.status !== "draft" && (
            <Button variant="outline" onClick={handleCopyLink} className="gap-2">
              <Copy className="h-4 w-4" />
              Copiar Link
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Salvando..." : "Salvar Rascunho"}
          </Button>
          
          <Button 
            onClick={() => handleSave(true)}
            disabled={isSaving}
            variant="gradient"
            className="gap-2"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSaving 
              ? "Enviando..." 
              : (proposal?.status === "draft" || isNew ? "Salvar e Enviar" : "Atualizar")}
          </Button>
        </div>
      </div>
      
      {/* Template Selector - Only for new proposals */}
      {isNew && templates && templates.length > 0 && !templateApplied && (
        <TemplateSelectorCard
          templates={templates}
          onSelectTemplate={handleApplyTemplate}
          onStartFromScratch={() => setTemplateApplied(true)}
        />
      )}
      
      {/* Summary Card */}
      <Card className="glass border-luma-glass-border">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-xl font-semibold">
                {formatCurrency(items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}
              </p>
            </div>
            {discountAmount > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Desconto</p>
                <p className="text-xl font-semibold text-emerald-500">
                  -{formatCurrency(discountAmount)}
                </p>
              </div>
            )}
            <div className="ml-auto">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(calculateTotal())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass border-luma-glass-border w-full justify-start overflow-x-auto">
          <TabsTrigger value="client" className="gap-2">
            <User className="h-4 w-4" />
            Cliente
          </TabsTrigger>
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
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        {/* Client Tab */}
        <TabsContent value="client" className="mt-6">
          <Card className="glass border-luma-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
              <CardDescription>
                Selecione um lead existente ou preencha os dados manualmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Proposal Type Selector */}
              <ProposalTypeSelector
                value={proposalType}
                onChange={handleProposalTypeChange}
              />
              
              <div className="space-y-2">
                <Label>Título da Proposta *</Label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (titleError) setTitleError(false);
                  }}
                  placeholder={proposalType === 'video' 
                    ? "Ex: Vídeo Institucional - Empresa XYZ" 
                    : "Ex: Cobertura de Casamento - João e Maria"}
                  className={`glass border-luma-glass-border ${titleError ? "border-destructive" : ""}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Vincular a um Lead</Label>
                <Select value={leadId || "none"} onValueChange={(val) => setLeadId(val === "none" ? "" : val)}>
                  <SelectTrigger className="glass border-luma-glass-border">
                    <SelectValue placeholder="Selecione um lead (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum lead selecionado</SelectItem>
                    {leads?.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name || lead.email || lead.whatsapp || "Lead sem nome"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do Cliente</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="João da Silva"
                    className="glass border-luma-glass-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail do Cliente</Label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="joao@email.com"
                    className="glass border-luma-glass-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Items Tab */}
        <TabsContent value="items" className="mt-6">
          <Card className="glass border-luma-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Valor da Proposta
              </CardTitle>
              <CardDescription>
                Defina o valor total ou adicione itens detalhados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProposalItemsEditor
                items={items}
                onChange={setItems}
                discountAmount={discountAmount}
                onDiscountChange={setDiscountAmount}
                useManualTotal={useManualTotal}
                onUseManualTotalChange={setUseManualTotal}
                manualTotalAmount={manualTotalAmount}
                onManualTotalChange={setManualTotalAmount}
                isVideoMode={proposalType === 'video'}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contract Tab */}
        <TabsContent value="contract" className="mt-6">
          <Card className="glass border-luma-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contrato
              </CardTitle>
              <CardDescription>
                Escreva o contrato e use variáveis mágicas que serão preenchidas pelo cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContractEditor
                content={contractContent}
                onChange={setContractContent}
                templates={templates}
              />
              
              {requiredFields.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                      Campos que o cliente precisará preencher:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {requiredFields.map((field) => (
                      <Badge key={field} variant="secondary" className="bg-primary/20 text-primary">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Tab */}
        <TabsContent value="payment" className="mt-6">
          <Card className="glass border-luma-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informações de Pagamento
              </CardTitle>
              <CardDescription>
                Selecione uma configuração de pagamento ou crie uma nova
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Config Selector */}
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <PaymentConfigSelector
                  profileId={profile?.id || ""}
                  selectedConfigId={paymentConfigId}
                  onSelect={setPaymentConfigId}
                />
              </div>
              
              {/* Additional instructions (legacy support) */}
              <div className="space-y-2">
                <Label>Instruções Adicionais (opcional)</Label>
                <Textarea
                  value={paymentInfo}
                  onChange={(e) => setPaymentInfo(e.target.value)}
                  placeholder="Informações extras sobre o pagamento..."
                  className="glass border-luma-glass-border min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Estas instruções serão exibidas além dos dados da configuração selecionada.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card className="glass border-luma-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Defina a validade e outras opções da proposta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Válida até
                </Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="glass border-luma-glass-border w-full sm:w-auto"
                />
                <p className="text-sm text-muted-foreground">
                  Após essa data, a proposta será exibida como expirada para o cliente.
                </p>
              </div>
              
              {/* Video-specific settings */}
              {proposalType === 'video' && (
                <div className="space-y-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    🎬 Configurações de Vídeo
                  </h3>
                  
                  <VideoHeroInput
                    value={coverVideoUrl}
                    onChange={setCoverVideoUrl}
                  />
                  
                  <VideoConfigFields
                    revisionLimit={revisionLimit}
                    onRevisionLimitChange={setRevisionLimit}
                    deliveryFormats={deliveryFormats}
                    onDeliveryFormatsChange={setDeliveryFormats}
                    estimatedDurationMin={estimatedDurationMin}
                    onEstimatedDurationChange={setEstimatedDurationMin}
                    projectFormat={projectFormat}
                    onProjectFormatChange={setProjectFormat}
                  />
                  
                  <ReferencesEditor
                    referenceLinks={referenceLinks}
                    onReferenceLinksChange={setReferenceLinks}
                    soundtrackLinks={soundtrackLinks}
                    onSoundtrackLinksChange={setSoundtrackLinks}
                  />
                </div>
              )}
              
              {!isNew && proposal?.public_token && (
                <div className="space-y-2">
                  <Label>Link Público</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${window.location.origin}/proposta/${proposal.public_token}`}
                      readOnly
                      className="glass border-luma-glass-border"
                    />
                    <Button variant="outline" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
