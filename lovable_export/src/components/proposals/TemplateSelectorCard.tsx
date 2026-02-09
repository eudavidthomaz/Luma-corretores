import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Package,
  Calendar,
  CreditCard,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tables } from "@/integrations/supabase/types";

type ProposalTemplate = Tables<"proposal_templates">;

interface TemplateSelectorCardProps {
  templates: ProposalTemplate[];
  onSelectTemplate: (template: ProposalTemplate) => void;
  onStartFromScratch: () => void;
}

export function TemplateSelectorCard({
  templates,
  onSelectTemplate,
  onStartFromScratch,
}: TemplateSelectorCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!templates || templates.length === 0) {
    return null;
  }

  const getItemsCount = (template: ProposalTemplate) => {
    const items = template.default_items as unknown[];
    return Array.isArray(items) ? items.length : 0;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="glass border-luma-glass-border border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Início Rápido
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Recomendado
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Use um template para preencher automaticamente
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template, index) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectTemplate(template)}
                  className="group p-4 rounded-xl border border-luma-glass-border bg-card/50 text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {template.title}
                      </p>
                      {template.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {template.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {getItemsCount(template) > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <Package className="h-2.5 w-2.5 mr-1" />
                            {getItemsCount(template)}
                          </Badge>
                        )}
                        {template.default_valid_days && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <Calendar className="h-2.5 w-2.5 mr-1" />
                            {template.default_valid_days}d
                          </Badge>
                        )}
                        {template.content && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <FileText className="h-2.5 w-2.5 mr-1" />
                            Contrato
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
              
              {/* Start from scratch option */}
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: templates.length * 0.05 }}
                onClick={onStartFromScratch}
                className="p-4 rounded-xl border border-dashed border-muted-foreground/30 text-left hover:border-muted-foreground/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Começar do Zero
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Preencher manualmente
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
