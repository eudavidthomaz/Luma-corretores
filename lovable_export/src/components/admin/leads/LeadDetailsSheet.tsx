import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Phone,
  Calendar,
  Tag,
  Save,
  Loader2,
  MessageSquare,
  User,
  Bot,
  MapPin,
  Flame,
  FileText,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tables, Enums } from "@/integrations/supabase/types";
import { useUpdateLead, leadStatusLabels, heatLevelLabels, heatLevelColors } from "@/hooks/useLeads";
import { useCategoryById } from "@/hooks/useCategories";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { toast } from "@/hooks/use-toast";

interface LeadDetailsSheetProps {
  lead: Tables<"leads"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<Enums<"lead_status">, string> = {
  novo: "bg-primary/20 text-primary border-primary/30",
  qualificando: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  engajado: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  em_contato: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  proposta_enviada: "bg-secondary/20 text-secondary border-secondary/30",
  pronto: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  convertido: "bg-green-500/20 text-green-400 border-green-500/30",
  perdido: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function LeadDetailsSheet({ lead, open, onOpenChange }: LeadDetailsSheetProps) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(lead?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const updateLead = useUpdateLead();

  const { data: messages, isLoading: loadingMessages } = useConversationHistory(lead?.session_id);

  // Get category by ID
  const category = useCategoryById(lead?.interest_category_id || null);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || "");
    }
  }, [lead]);

  const handleSaveNotes = async () => {
    if (!lead) return;

    setIsSaving(true);
    try {
      await updateLead.mutateAsync({ id: lead.id, notes });
      toast({ title: "Notas salvas!" });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!lead) return null;

  const heatLevel = (lead.heat_level || "cold") as "cold" | "warm" | "hot";
  const categoryName = category?.name || lead.interest_category || null;
  const categoryColor = category?.color || "gray";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass border-luma-glass-border w-full sm:max-w-lg flex flex-col overflow-hidden p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-luma-glass-border">
          <SheetTitle className="text-xl flex items-center gap-3">
            {lead.name || "Lead sem nome"}
            <Badge className={`${heatLevelColors[heatLevel]} text-xs`}>
              <Flame className="h-3 w-3 mr-1" />
              {heatLevelLabels[heatLevel]}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 mx-6 mt-4" style={{ width: "calc(100% - 3rem)" }}>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="conversation" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversa
              {messages && messages.length > 0 && (
                <span className="bg-primary/20 text-primary text-xs px-1.5 rounded-full">
                  {messages.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Contact Info */}
            <div className="space-y-3">
              {lead.email && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${lead.email}`} className="hover:text-primary transition-colors">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.whatsapp && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a
                    href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {lead.whatsapp}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {lead.event_location && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{lead.event_location}</span>
                </div>
              )}
              {lead.event_date && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{lead.event_date}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4 opacity-50" />
                <span className="opacity-70">
                  Capturado em {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>

            {/* Collected Data Summary */}
            {(lead.service_type || lead.style_preference || lead.budget_signal) && (
              <div className="p-4 rounded-xl bg-muted/30 border border-luma-glass-border space-y-2">
                <p className="text-sm font-medium text-foreground">Dados Coletados pela IA</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {lead.service_type && (
                    <div>
                      <span className="text-muted-foreground">Serviço:</span>{" "}
                      <span className="text-foreground">{lead.service_type}</span>
                    </div>
                  )}
                  {lead.style_preference && (
                    <div>
                      <span className="text-muted-foreground">Estilo:</span>{" "}
                      <span className="text-foreground">{lead.style_preference}</span>
                    </div>
                  )}
                  {lead.budget_signal && (
                    <div>
                      <span className="text-muted-foreground">Orçamento:</span>{" "}
                      <span className="text-foreground">{lead.budget_signal}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Summary */}
            {lead.ai_summary && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-2">✨ Resumo da IA</p>
                <p className="text-sm text-foreground">{lead.ai_summary}</p>
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={statusColors[lead.status]}>
                {leadStatusLabels[lead.status]}
              </Badge>
              {categoryName && (
                <Badge className={`bg-${categoryColor}-500/20 text-${categoryColor}-400 border-0`}>
                  <Tag className="h-3 w-3 mr-1" />
                  {categoryName}
                </Badge>
              )}
              {lead.conversation_phase && (
                <Badge variant="outline" className="bg-muted/50">
                  {lead.conversation_phase}
                </Badge>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notas Internas</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione anotações sobre este lead..."
                className="min-h-[100px] glass border-luma-glass-border"
              />
              <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Salvar notas
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="conversation" className="flex-1 overflow-hidden px-6 py-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages && messages.length > 0 ? (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.role === "user" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                        }`}
                      >
                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                        <div
                          className={`inline-block p-3 rounded-2xl text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted/50 text-foreground rounded-bl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Nenhuma mensagem registrada</p>
                <p className="text-sm mt-1">O histórico aparecerá aqui após interações no chat</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="border-t border-luma-glass-border p-4 flex gap-3">
          <Button
            className="flex-1 gap-2"
            onClick={() => {
              onOpenChange(false);
              navigate(`/admin/proposals/new?leadId=${lead.id}`);
            }}
          >
            <FileText className="h-4 w-4" />
            Criar Proposta
          </Button>
          {lead.whatsapp && (
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => window.open(`https://wa.me/${lead.whatsapp?.replace(/\D/g, "")}`, "_blank")}
            >
              <Phone className="h-4 w-4" />
              WhatsApp
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
