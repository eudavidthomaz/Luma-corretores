import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, User, FileText, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultContractVariables } from "@/hooks/useProposalTemplates";

interface ClientDataFormProps {
  requiredFields: string[];
  initialData: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void;
}

// Input masks
const applyMask = (value: string, mask: string): string => {
  let result = "";
  let valueIndex = 0;
  const cleanValue = value.replace(/\D/g, "");
  
  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === "0") {
      result += cleanValue[valueIndex];
      valueIndex++;
    } else {
      result += mask[i];
    }
  }
  
  return result;
};

const masks: Record<string, string> = {
  cpf: "000.000.000-00",
  telefone: "(00) 00000-0000",
  cep: "00000-000",
};

export function ClientDataForm({ requiredFields, initialData, onSubmit }: ClientDataFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(initialData);
  
  // Campos que NÃO devem ser preenchidos pelo cliente
  const EXCLUDED_FIELDS = [
    'valor_total',
    'data_assinatura',
    'itens_proposta',
    'revision_limit',
    'delivery_formats',
    'estimated_duration',
    'project_format',
  ];

  // Filtrar campos excluídos
  const fields = (requiredFields || []).filter(
    field => !EXCLUDED_FIELDS.includes(field)
  );
  
  // Get field config from defaults
  const getFieldConfig = (key: string) => {
    return defaultContractVariables.find(v => v.key === key) || {
      key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      placeholder: ""
    };
  };
  
  const handleChange = (key: string, value: string) => {
    const mask = masks[key];
    const finalValue = mask ? applyMask(value, mask) : value;
    setFormData(prev => ({ ...prev, [key]: finalValue }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const isValid = fields.length === 0 || fields.every(field => formData[field]?.trim());

  // Group common fields
  const personalFields = fields.filter(f => 
    ['nome_cliente', 'cpf', 'rg', 'telefone', 'email'].includes(f)
  );
  const addressFields = fields.filter(f => 
    ['endereco', 'cidade', 'estado', 'cep'].includes(f)
  );
  const eventFields = fields.filter(f => 
    ['data_evento', 'local_evento', 'horario_evento'].includes(f)
  );
  const otherFields = fields.filter(f => 
    ![...personalFields, ...addressFields, ...eventFields].includes(f)
  );

  // Get input type based on field
  const getInputType = (field: string): string => {
    if (field === 'data_evento') return 'date';
    if (field === 'horario_evento') return 'time';
    if (field === 'email') return 'email';
    return 'text';
  };

  // Get inputMode for mobile keyboards
  const getInputMode = (field: string): "text" | "email" | "tel" | "numeric" => {
    if (field === 'email') return 'email';
    if (field === 'telefone') return 'tel';
    if (['cpf', 'cep', 'rg'].includes(field)) return 'numeric';
    return 'text';
  };

  // Get autocomplete hint
  const getAutoComplete = (field: string): string => {
    const map: Record<string, string> = {
      nome_cliente: 'name',
      email: 'email',
      telefone: 'tel',
      endereco: 'street-address',
      cidade: 'address-level2',
      estado: 'address-level1',
      cep: 'postal-code',
    };
    return map[field] || 'off';
  };

  // Get max length for masked fields
  const getMaxLength = (field: string): number | undefined => {
    const mask = masks[field];
    return mask ? mask.length : undefined;
  };

  const renderFieldGroup = (
    groupFields: string[], 
    icon: React.ReactNode, 
    title: string
  ) => {
    if (groupFields.length === 0) return null;
    
    return (
      <div className="gallery-glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
        <h3 className="font-medium text-sm sm:text-base text-gallery-text flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {groupFields.map(field => {
            const config = getFieldConfig(field);
            const mask = masks[field];
            const isWide = ['nome_cliente', 'endereco', 'local_evento'].includes(field);
            
            return (
              <div key={field} className={`space-y-1.5 sm:space-y-2 ${isWide ? 'sm:col-span-2' : ''}`}>
                <Label className="text-gallery-text text-sm">{config.label}</Label>
                <Input
                  value={formData[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={mask || config.placeholder}
                  className="gallery-input h-12 text-base touch-manipulation"
                  type={getInputType(field)}
                  inputMode={getInputMode(field)}
                  autoComplete={getAutoComplete(field)}
                  maxLength={getMaxLength(field)}
                  enterKeyHint="next"
                  required
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="space-y-4 sm:space-y-6"
    >
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gallery-accent/10 mb-3 sm:mb-4">
          <User className="h-7 w-7 sm:h-8 sm:w-8 text-gallery-accent" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-editorial-display text-gallery-text mb-1 sm:mb-2">
          Seus Dados
        </h2>
        <p className="text-sm sm:text-base text-gallery-text-muted px-4">
          Preencha as informações abaixo para gerar o contrato
        </p>
      </div>
      
      {renderFieldGroup(personalFields, <User className="h-4 w-4" />, "Dados Pessoais")}
      {renderFieldGroup(addressFields, <MapPin className="h-4 w-4" />, "Endereço")}
      {renderFieldGroup(eventFields, <Calendar className="h-4 w-4" />, "Dados do Evento")}
      {renderFieldGroup(otherFields, <FileText className="h-4 w-4" />, "Outras Informações")}
      
      {/* Sticky submit button */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-gallery-background via-gallery-background to-transparent -mx-4 px-4 sm:static sm:bg-none sm:mx-0 sm:px-0">
        <Button
          type="submit"
          disabled={!isValid}
          className="w-full gallery-btn-primary h-14 text-base sm:text-lg font-semibold"
        >
          Continuar para o Contrato
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </motion.form>
  );
}
