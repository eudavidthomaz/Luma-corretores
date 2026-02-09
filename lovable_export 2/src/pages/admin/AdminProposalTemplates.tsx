import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Trash2, 
  Edit, 
  Copy, 
  Package,
  Calendar,
  CreditCard,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useProposalTemplates, 
  useDeleteProposalTemplate,
  useCreateProposalTemplate
} from "@/hooks/useProposalTemplates";
import { TemplateEditorModal } from "@/components/proposals/TemplateEditorModal";

interface AdminProposalTemplatesProps {
  embedded?: boolean;
}

export default function AdminProposalTemplates({ embedded = false }: AdminProposalTemplatesProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: templates, isLoading } = useProposalTemplates(profile?.id);
  const deleteTemplate = useDeleteProposalTemplate();
  const createTemplate = useCreateProposalTemplate();
  
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDuplicate = async (template: typeof templates[number]) => {
    if (!profile?.id) return;
    
    try {
      await createTemplate.mutateAsync({
        profile_id: profile.id,
        title: `${template.title} (Cópia)`,
        description: template.description,
        content: template.content,
        default_items: template.default_items,
        default_payment_config_id: template.default_payment_config_id,
        default_valid_days: template.default_valid_days,
        variables: template.variables,
      });
      
      toast({
        title: "Template duplicado!",
        description: "Uma cópia do template foi criada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao duplicar",
        description: "Não foi possível duplicar o template.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync(templateId);
      toast({
        title: "Template excluído!",
        description: "O template foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o template.",
        variant: "destructive",
      });
    }
    setDeleteConfirmId(null);
  };

  const getItemsCount = (template: typeof templates[number]) => {
    const items = template.default_items as unknown[];
    return Array.isArray(items) ? items.length : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Only show when not embedded */}
      {!embedded && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Templates de Propostas</h1>
            <p className="text-muted-foreground">
              Crie modelos reutilizáveis para agilizar a criação de propostas
            </p>
          </div>
          
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Template
          </Button>
        </div>
      )}

      {/* Action button when embedded - simpler layout */}
      {embedded && (
        <div className="flex justify-end">
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Template
          </Button>
        </div>
      )}

      {/* Templates Grid */}
      {templates && templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass border-luma-glass-border h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        {template.description && (
                          <CardDescription className="line-clamp-1">
                            {template.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTemplateId(template.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteConfirmId(template.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {getItemsCount(template) > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Package className="h-3 w-3" />
                        {getItemsCount(template)} itens
                      </Badge>
                    )}
                    {template.default_valid_days && (
                      <Badge variant="secondary" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        {template.default_valid_days} dias
                      </Badge>
                    )}
                    {template.default_payment_config_id && (
                      <Badge variant="secondary" className="gap-1">
                        <CreditCard className="h-3 w-3" />
                        Pagamento
                      </Badge>
                    )}
                    {template.content && (
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        Contrato
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="glass border-luma-glass-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum template criado
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Crie templates para reutilizar configurações de propostas como itens, 
              contratos e formas de pagamento.
            </p>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template Editor Modal */}
      <TemplateEditorModal
        open={isCreating || !!editingTemplateId}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingTemplateId(null);
          }
        }}
        templateId={editingTemplateId}
        profileId={profile?.id || ""}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O template será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
