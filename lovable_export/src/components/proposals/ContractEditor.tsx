import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Type, 
  Eye, 
  FileText,
  Sparkles,
  Wand2,
  Loader2
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { defaultContractVariables, replaceVariables } from "@/hooks/useProposalTemplates";
import { useEnhanceContract } from "@/hooks/useEnhanceContract";
import { useToast } from "@/hooks/use-toast";

type ProposalTemplate = Tables<"proposal_templates">;

interface ContractEditorProps {
  content: string;
  onChange: (content: string) => void;
  templates?: ProposalTemplate[];
}

export function ContractEditor({ 
  content, 
  onChange, 
  templates,
}: ContractEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const { toast } = useToast();
  const enhanceContract = useEnhanceContract();
  
  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    
    const before = text.substring(0, start);
    const after = text.substring(end);
    const insertion = `{{${variable}}}`;
    
    onChange(before + insertion + after);
    
    // Move cursor after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
    }, 0);
  };
  
  const loadTemplate = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      onChange(template.content);
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!content.trim()) {
      toast({
        title: "Contrato vazio",
        description: "Cole o texto do contrato antes de aprimorar com IA.",
        variant: "destructive",
      });
      return;
    }

    try {
      const enhanced = await enhanceContract.mutateAsync(content);
      onChange(enhanced);
      toast({
        title: "Contrato aprimorado! ✨",
        description: "Variáveis mágicas e formatação foram aplicadas automaticamente.",
      });
    } catch (error) {
      console.error("Error enhancing contract:", error);
      toast({
        title: "Erro ao aprimorar",
        description: error instanceof Error ? error.message : "Tente novamente ou edite manualmente.",
        variant: "destructive",
      });
    }
  };
  
  // Create preview with sample data
  const previewContent = replaceVariables(content, {
    nome_cliente: "João da Silva",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    endereco: "Rua das Flores, 123 - Centro",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    telefone: "(11) 99999-9999",
    email: "joao@email.com",
    data_evento: "15/03/2025",
    local_evento: "Espaço Celebration",
    horario_evento: "16:00",
    valor_total: "R$ 5.000,00",
    data_assinatura: new Date().toLocaleDateString("pt-BR"),
  }, [
    { name: "Cobertura fotográfica completa - 8 horas", quantity: 1, unit_price: 3500, show_price: true },
    { name: "Álbum Premium 30x30 - 40 páginas", quantity: 1, unit_price: 1200, show_price: true },
    { name: "Pendrive com todas as fotos editadas", quantity: 1, unit_price: 300, show_price: true },
  ]);

  return (
    <div className="space-y-4">
      {/* Template selector */}
      {templates && templates.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Carregar Modelo
          </Label>
          <Select onValueChange={loadTemplate}>
            <SelectTrigger className="glass border-luma-glass-border w-full sm:w-[300px]">
              <SelectValue placeholder="Selecione um modelo salvo" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Editor/Preview tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
        <TabsList className="glass border-luma-glass-border">
          <TabsTrigger value="edit" className="gap-2">
            <Type className="h-4 w-4" />
            Editar
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Prévia
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-4 space-y-4">
          {/* Variable buttons */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Variáveis Mágicas
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Clique para inserir no texto. O cliente preencherá esses campos ao assinar.
            </p>
            <div className="flex flex-wrap gap-2">
              {defaultContractVariables.map((variable) => (
                <Button
                  key={variable.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(variable.key)}
                  className={`text-xs h-7 px-2 hover:bg-primary/10 hover:border-primary/50 ${
                    variable.isSpecial ? "bg-primary/10 border-primary/30 text-primary" : ""
                  }`}
                >
                  {`{{${variable.key}}}`}
                </Button>
              ))}
            </div>
          </div>

          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Cole aqui o texto do seu contrato...

Exemplo:

CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS

Pelo presente instrumento particular, de um lado:

CONTRATANTE:
Nome: {{nome_cliente}}
CPF: {{cpf}}
Endereço: {{endereco}}, {{cidade}} - {{estado}}
Telefone: {{telefone}}
E-mail: {{email}}

CONTRATADO:
[Seus dados aqui]

CLÁUSULA 1ª - DO OBJETO
O presente contrato tem como objeto a prestação de serviços fotográficos para o evento a ser realizado em {{data_evento}}, no local {{local_evento}}, às {{horario_evento}}.

CLÁUSULA 2ª - DOS SERVIÇOS CONTRATADOS
{{itens_proposta}}

CLÁUSULA 3ª - DO VALOR
O valor total dos serviços é de {{valor_total}}.

{{cidade}}, {{data_assinatura}}

_______________________________
CONTRATANTE: {{nome_cliente}}

_______________________________
CONTRATADO`}
            className="glass border-luma-glass-border min-h-[400px] font-mono text-sm"
          />

          {/* AI Enhance Button */}
          <Button
            type="button"
            onClick={handleEnhanceWithAI}
            disabled={enhanceContract.isPending || !content.trim()}
            className="w-full gap-2 bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90"
            size="lg"
          >
            {enhanceContract.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Aprimorando com IA...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                Aprimorar com IA
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            A IA irá adicionar variáveis mágicas, corrigir gramática e formatar o contrato automaticamente.
          </p>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <div className="glass border-luma-glass-border rounded-xl p-6 min-h-[400px]">
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                {previewContent || "Digite o conteúdo do contrato para ver a prévia..."}
              </pre>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            💡 Esta é uma prévia com dados fictícios. Os valores reais serão preenchidos pelo cliente.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
