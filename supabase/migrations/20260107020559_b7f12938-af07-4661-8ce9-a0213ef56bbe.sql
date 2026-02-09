-- Adicionar identificadores de canal na tabela leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS instagram_id text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS browser_fingerprint text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source text DEFAULT 'site';

-- Índices para busca rápida por identificadores
CREATE INDEX IF NOT EXISTS idx_leads_instagram_id ON public.leads(instagram_id) WHERE instagram_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_browser_fingerprint ON public.leads(browser_fingerprint) WHERE browser_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp ON public.leads(whatsapp) WHERE whatsapp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email) WHERE email IS NOT NULL;

-- Adicionar lead_id na tabela conversation_messages para histórico unificado
ALTER TABLE public.conversation_messages ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON public.conversation_messages(lead_id) WHERE lead_id IS NOT NULL;