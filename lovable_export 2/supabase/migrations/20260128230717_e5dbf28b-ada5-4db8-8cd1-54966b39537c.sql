-- =====================================================
-- SMART PROPOSALS & CONTRACTS MODULE
-- Phase 1: Database Schema
-- =====================================================

-- 1. Create proposal_status enum
CREATE TYPE proposal_status AS ENUM (
  'draft',
  'sent', 
  'viewed',
  'approved',
  'changes_requested',
  'signed',
  'paid',
  'cancelled'
);

-- =====================================================
-- 2. PROPOSAL_TEMPLATES - Modelos reutilizáveis
-- =====================================================
CREATE TABLE proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage templates"
ON proposal_templates FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Trigger for updated_at
CREATE TRIGGER update_proposal_templates_updated_at
BEFORE UPDATE ON proposal_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. PROPOSALS - Propostas enviadas aos clientes
-- =====================================================
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  template_id UUID REFERENCES proposal_templates(id) ON DELETE SET NULL,
  
  -- Identificação
  title TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  
  -- Link público (UUID único para acesso anônimo)
  public_token UUID UNIQUE DEFAULT gen_random_uuid(),
  
  -- Status e validade
  status proposal_status DEFAULT 'draft',
  valid_until DATE,
  
  -- Valores
  total_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Conteúdo do contrato (cópia do template no momento do envio)
  contract_content TEXT,
  required_fields TEXT[] DEFAULT '{}',
  
  -- Pagamento
  payment_info TEXT,
  
  -- Notas de alteração
  change_request_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Dono pode gerenciar suas propostas
CREATE POLICY "Owners can manage proposals"
ON proposals FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Acesso público via token (somente leitura, excluindo drafts)
CREATE POLICY "Public can view via token"
ON proposals FOR SELECT
USING (public_token IS NOT NULL AND status != 'draft');

-- Trigger for updated_at
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON proposals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. PROPOSAL_ITEMS - Itens do pacote/proposta
-- =====================================================
CREATE TABLE proposal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  
  -- Ordenação
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;

-- Dono pode gerenciar items via proposal
CREATE POLICY "Owners can manage items"
ON proposal_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.id = proposal_items.proposal_id 
    AND proposals.profile_id = auth.uid()
  )
);

-- Público pode ver items de proposta visível
CREATE POLICY "Public can view items"
ON proposal_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.id = proposal_items.proposal_id 
    AND proposals.public_token IS NOT NULL
    AND proposals.status != 'draft'
  )
);

-- =====================================================
-- 5. CONTRACTS - Documento final assinado
-- =====================================================
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  
  -- Conteúdo congelado
  signed_content TEXT NOT NULL,
  
  -- Dados do cliente
  client_data JSONB NOT NULL DEFAULT '{}',
  
  -- Assinatura
  signature_image_url TEXT,
  signature_image_path TEXT,
  
  -- Metadados legais
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_ip TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Dono pode ver contratos de suas propostas
CREATE POLICY "Owners can view contracts"
ON contracts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.id = contracts.proposal_id 
    AND proposals.profile_id = auth.uid()
  )
);

-- Público pode criar contrato (via edge function com validação)
CREATE POLICY "Public can create contracts"
ON contracts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.id = contracts.proposal_id 
    AND proposals.status = 'approved'
  )
);

-- Público pode ver seu próprio contrato
CREATE POLICY "Public can view own contract"
ON contracts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.id = contracts.proposal_id 
    AND proposals.public_token IS NOT NULL
    AND proposals.status IN ('signed', 'paid')
  )
);

-- =====================================================
-- 6. PAYMENT_RECEIPTS - Comprovantes de pagamento
-- =====================================================
CREATE TABLE payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT,
  
  notes TEXT,
  
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  uploaded_by TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- Dono pode gerenciar comprovantes
CREATE POLICY "Owners can manage receipts"
ON payment_receipts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.id = payment_receipts.proposal_id 
    AND proposals.profile_id = auth.uid()
  )
);

-- Público pode inserir comprovante (proposta assinada)
CREATE POLICY "Public can upload receipts"
ON payment_receipts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.id = payment_receipts.proposal_id 
    AND proposals.status = 'signed'
  )
);

-- =====================================================
-- 7. STORAGE BUCKET - proposal-files
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposal-files', 'proposal-files', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Owners can manage their proposal files
CREATE POLICY "Owners can manage proposal files"
ON storage.objects FOR ALL
USING (
  bucket_id = 'proposal-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Public can upload signatures (via token validation in edge function)
CREATE POLICY "Public can upload to proposal-files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'proposal-files'
);

-- Policy: Public can read signed files
CREATE POLICY "Public can read proposal files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'proposal-files'
);