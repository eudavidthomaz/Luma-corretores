import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  FileText, 
  FileStack,
  Copy, 
  ExternalLink, 
  MoreHorizontal,
  Trash2,
  Edit,
  Send,
  Calendar,
  User,
  DollarSign,
  Filter,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { UpgradeModal } from "@/components/admin/UpgradeModal";
import { 
  useProposals, 
  useDeleteProposal, 
  useUpdateProposal,
  proposalStatusLabels, 
  proposalStatusColors,
  ProposalStatus 
} from "@/hooks/useProposals";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AdminProposalTemplates from "./AdminProposalTemplates";

export default function AdminProposals() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasProposals, maxProposals, isFree } = useFeatureAccess();
  const upgradeModal = useUpgradeModal();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("proposals");
  
  const { data: proposals, isLoading, error: proposalsError } = useProposals(profile?.id);
  const deleteProposal = useDeleteProposal();
  const updateProposal = useUpdateProposal();
  
  // Count active proposals (not cancelled)
  const activeProposalsCount = proposals?.filter(p => p.status !== "cancelled").length || 0;
  const canCreateMore = activeProposalsCount < maxProposals;
  
  // Filter proposals
  const filteredProposals = proposals?.filter(proposal => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(search.toLowerCase()) ||
      proposal.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      proposal.client_email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/proposta/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "O link da proposta foi copiado para a área de transferência.",
    });
  };
  
  const handleSendProposal = async (proposalId: string) => {
    try {
      await updateProposal.mutateAsync({
        id: proposalId,
        status: "sent",
        sent_at: new Date().toISOString(),
      });
      toast({
        title: "Proposta enviada!",
        description: "O status foi atualizado para 'Enviada'.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (proposalId: string) => {
    try {
      await deleteProposal.mutateAsync(proposalId);
      toast({
        title: "Proposta excluída",
        description: "A proposta foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a proposta.",
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

  // Handle create proposal with limit check
  const handleCreateProposal = () => {
    if (!hasProposals) {
      upgradeModal.open({
        feature: "proposals",
        customTitle: "Desbloqueie Propostas Inteligentes",
        customDescription: "Crie propostas profissionais com contratos e assinatura digital. Faça upgrade para acessar este recurso.",
      });
      return;
    }
    
    if (!canCreateMore) {
      upgradeModal.open({
        feature: "proposals",
        customTitle: "Limite de Propostas Atingido",
        customDescription: `Você atingiu o limite de ${maxProposals} propostas do seu plano. Faça upgrade para criar mais propostas.`,
      });
      return;
    }
    
    navigate("/admin/proposals/new");
  };

  // Show upgrade prompt for free users
  if (!hasProposals) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Propostas</h1>
            <p className="text-muted-foreground">
              Gerencie suas propostas comerciais e contratos
            </p>
          </div>
        </div>
        
        <Card className="glass border-luma-glass-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Propostas Inteligentes</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Crie propostas profissionais com itens, contratos personalizados e assinatura digital. 
              Disponível nos planos pagos.
            </p>
            <Button 
              onClick={() => upgradeModal.open({ feature: "proposals" })}
              variant="gradient"
              className="gap-2"
            >
              Fazer Upgrade
            </Button>
          </CardContent>
        </Card>
        
        <UpgradeModal 
          open={upgradeModal.isOpen} 
          onOpenChange={upgradeModal.setOpen}
          feature={upgradeModal.feature}
          customTitle={upgradeModal.customTitle}
          customDescription={upgradeModal.customDescription}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Propostas</h1>
          <p className="text-muted-foreground">
            Gerencie suas propostas comerciais e contratos
            {maxProposals < 999 && (
              <span className="ml-2 text-xs">
                ({activeProposalsCount}/{maxProposals} propostas)
              </span>
            )}
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="glass border border-luma-glass-border">
            <TabsTrigger value="proposals" className="gap-2">
              <FileText className="h-4 w-4" />
              Propostas
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileStack className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "proposals" && (
            <Button 
              onClick={handleCreateProposal} 
              className="gap-2"
              variant="gradient"
            >
              <Plus className="h-4 w-4" />
              Nova Proposta
            </Button>
          )}
        </div>
        
        <TabsContent value="proposals" className="space-y-4 mt-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, cliente ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 glass border-luma-glass-border"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] glass border-luma-glass-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(proposalStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Error State */}
          {proposalsError && (
            <Card className="glass border-luma-glass-border border-destructive/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-destructive font-medium mb-2">
                    Erro ao carregar propostas
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {proposalsError instanceof Error ? proposalsError.message : "Erro desconhecido"}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Proposals List */}
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass border-luma-glass-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !proposalsError && filteredProposals?.length === 0 ? (
            <Card className="glass border-luma-glass-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma proposta encontrada</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {search || statusFilter !== "all" 
                    ? "Tente ajustar os filtros de busca."
                    : "Crie sua primeira proposta para começar a fechar mais negócios!"}
                </p>
                {!search && statusFilter === "all" && (
                  <Button 
                    onClick={() => navigate("/admin/proposals/new")} 
                    variant="gradient"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Criar Proposta
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile Proposals View */}
              <div className="md:hidden space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredProposals?.map((proposal, index) => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className="bento-card">
                        <CardContent className="p-4 space-y-3">
                          {/* Header: Status + Value */}
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              className={proposalStatusColors[proposal.status as ProposalStatus]}
                            >
                              {proposalStatusLabels[proposal.status as ProposalStatus]}
                            </Badge>
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(Number(proposal.total_amount) || 0)}
                            </span>
                          </div>
                          
                          {/* Content */}
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground">
                              {proposal.title}
                            </h3>
                            {proposal.client_name && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {proposal.client_name}
                              </p>
                            )}
                            {proposal.valid_until && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Válida até {format(new Date(proposal.valid_until), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            )}
                          </div>
                          
                          {/* Actions - Always visible on mobile */}
                          <div className="flex items-center gap-2 pt-2 border-t border-luma-glass-border">
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <Link to={`/admin/proposals/${proposal.id}`}>
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Editar
                              </Link>
                            </Button>
                            
                            {proposal.status === "draft" ? (
                              <Button 
                                variant="gradient" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleSendProposal(proposal.id)}
                              >
                                <Send className="h-3.5 w-3.5 mr-1" />
                                Enviar
                              </Button>
                            ) : proposal.public_token && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleCopyLink(proposal.public_token!)}
                              >
                                <Copy className="h-3.5 w-3.5 mr-1" />
                                Copiar Link
                              </Button>
                            )}
                            
                            {/* Kebab menu for less common actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {proposal.public_token && (
                                  <>
                                    <DropdownMenuItem asChild>
                                      <a 
                                        href={`/proposta/${proposal.public_token}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Ver Proposta
                                      </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDelete(proposal.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Desktop Proposals View */}
              <div className="hidden md:block">
                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredProposals?.map((proposal, index) => (
                      <motion.div
                        key={proposal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="glass border-luma-glass-border hover:border-primary/30 transition-all duration-200 group">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              {/* Icon */}
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-6 w-6 text-primary" />
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="font-semibold text-foreground truncate">
                                      {proposal.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                      {proposal.client_name && (
                                        <span className="flex items-center gap-1">
                                          <User className="h-3.5 w-3.5" />
                                          {proposal.client_name}
                                        </span>
                                      )}
                                      {proposal.valid_until && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3.5 w-3.5" />
                                          Válida até {format(new Date(proposal.valid_until), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        {formatCurrency(Number(proposal.total_amount) || 0)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Status Badge */}
                                  <Badge 
                                    variant="outline" 
                                    className={proposalStatusColors[proposal.status as ProposalStatus]}
                                  >
                                    {proposalStatusLabels[proposal.status as ProposalStatus]}
                                  </Badge>
                                </div>
                                
                                {/* Items preview */}
                                {proposal.proposal_items?.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-3">
                                    {proposal.proposal_items.slice(0, 3).map((item) => (
                                      <Badge 
                                        key={item.id} 
                                        variant="secondary" 
                                        className="text-xs bg-muted/50"
                                      >
                                        {item.description}
                                      </Badge>
                                    ))}
                                    {proposal.proposal_items.length > 3 && (
                                      <Badge variant="secondary" className="text-xs bg-muted/50">
                                        +{proposal.proposal_items.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {proposal.status === "draft" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSendProposal(proposal.id)}
                                    className="gap-1.5"
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                    Enviar
                                  </Button>
                                )}
                                
                                {proposal.public_token && proposal.status !== "draft" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => handleCopyLink(proposal.public_token!)}
                                      title="Copiar link"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      asChild
                                      title="Abrir proposta"
                                    >
                                      <a 
                                        href={`/proposta/${proposal.public_token}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  </>
                                )}
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon-sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link to={`/admin/proposals/${proposal.id}`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                      </Link>
                                    </DropdownMenuItem>
                                    {proposal.public_token && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleCopyLink(proposal.public_token!)}>
                                          <Copy className="h-4 w-4 mr-2" />
                                          Copiar Link
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                          <a 
                                            href={`/proposta/${proposal.public_token}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Ver Proposta
                                          </a>
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(proposal.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="mt-0">
          <AdminProposalTemplates embedded />
        </TabsContent>
      </Tabs>
      
      <UpgradeModal 
        open={upgradeModal.isOpen} 
        onOpenChange={upgradeModal.setOpen}
        feature={upgradeModal.feature}
        customTitle={upgradeModal.customTitle}
        customDescription={upgradeModal.customDescription}
      />
    </div>
  );
}
