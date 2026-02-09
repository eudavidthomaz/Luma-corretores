-- =============================================
-- FASE 1: Nova tabela para fotos do carrossel do mini-site
-- =============================================

CREATE TABLE public.minisite_carousel_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text NOT NULL,
  order_index integer DEFAULT 0,
  width integer,
  height integer,
  file_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Índice para busca rápida por profile
CREATE INDEX idx_minisite_carousel_profile ON public.minisite_carousel_photos(profile_id);

-- Habilitar RLS
ALTER TABLE public.minisite_carousel_photos ENABLE ROW LEVEL SECURITY;

-- Política: Dono pode gerenciar suas fotos do carrossel
CREATE POLICY "Owners can manage carousel photos"
ON public.minisite_carousel_photos FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Política: Público pode visualizar fotos do carrossel
CREATE POLICY "Public can view carousel photos"
ON public.minisite_carousel_photos FOR SELECT
USING (true);

-- =============================================
-- FASE 2: Novos campos na tabela profiles
-- =============================================

-- Headline customizada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS minisite_headline text;

-- Sub-headline customizada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS minisite_subheadline text;

-- Layout do carrossel (carousel ou pinterest)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS minisite_carousel_layout text DEFAULT 'carousel';

-- CTA do rodapé para usuários free
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS minisite_footer_cta_label text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS minisite_footer_cta_url text;