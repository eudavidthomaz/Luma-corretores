-- Tornar name nullable (lead pode começar sem nome)
ALTER TABLE public.leads ALTER COLUMN name DROP NOT NULL;

-- Adicionar novos campos para dados coletados na conversa
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS service_type text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS event_date text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS event_location text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS style_preference text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS budget_signal text;

-- Controle de funil
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS heat_level text DEFAULT 'cold';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS conversation_phase text DEFAULT 'abertura';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_interaction_at timestamptz DEFAULT now();

-- Identificador único da sessão de conversa
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS session_id text;

-- Resumo gerado pela IA
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ai_summary text;

-- Campo de completude para visualizar funil (0-100)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS data_completeness integer DEFAULT 0;

-- Adicionar novos valores ao enum lead_status
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'qualificando';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'engajado';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'pronto';

-- Índice para busca por session_id
CREATE INDEX IF NOT EXISTS idx_leads_session_id ON public.leads(session_id);

-- Índice para ordenação por última interação
CREATE INDEX IF NOT EXISTS idx_leads_last_interaction ON public.leads(last_interaction_at DESC);