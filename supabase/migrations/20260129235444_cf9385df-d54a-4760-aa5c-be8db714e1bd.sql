-- =============================================
-- FASE 1: Tabela de configurações de pagamento
-- =============================================

CREATE TABLE public.payment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('pix', 'bank_transfer', 'payment_link', 'custom')),
  
  -- Para PIX
  pix_key TEXT,
  pix_key_type TEXT CHECK (pix_key_type IS NULL OR pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  pix_holder_name TEXT,
  
  -- Para transferência bancária
  bank_name TEXT,
  bank_agency TEXT,
  bank_account TEXT,
  account_holder TEXT,
  account_document TEXT,
  
  -- Para link de pagamento externo
  payment_link_url TEXT,
  
  -- Instruções adicionais (texto livre)
  additional_instructions TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para payment_configs
ALTER TABLE payment_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage payment configs"
  ON payment_configs FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Trigger para updated_at
CREATE TRIGGER update_payment_configs_updated_at
  BEFORE UPDATE ON payment_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FASE 2: Expandir proposal_templates
-- =============================================

ALTER TABLE proposal_templates
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS default_payment_config_id UUID REFERENCES payment_configs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS default_items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS default_valid_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS default_payment_info TEXT;

-- =============================================
-- FASE 3: Expandir proposals
-- =============================================

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS use_manual_total BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_config_id UUID REFERENCES payment_configs(id) ON DELETE SET NULL;