-- Sprint 1: Tipo de proposta e campos de vídeo
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS proposal_type text DEFAULT 'photo';

ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS cover_video_url text;

ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS revision_limit integer DEFAULT 3;

ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS project_format text;

ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS estimated_duration_min integer;

ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS delivery_formats text[] DEFAULT '{}';

-- Categorias nos itens
ALTER TABLE public.proposal_items 
ADD COLUMN IF NOT EXISTS category text;

-- Referências e trilhas (para fases futuras)
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS reference_links jsonb DEFAULT '[]';

ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS soundtrack_links jsonb DEFAULT '[]';