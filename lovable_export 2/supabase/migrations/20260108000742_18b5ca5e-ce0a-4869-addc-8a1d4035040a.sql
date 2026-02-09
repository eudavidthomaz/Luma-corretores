-- =============================================
-- LUMA GALLERY - SCHEMA DE ENTREGA DE FOTOS
-- =============================================

-- Tabela: galleries (Galerias de entrega)
CREATE TABLE public.galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Identidade
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  cover_url text,
  event_date date,
  
  -- Proteção de acesso
  access_password text, -- Senha em texto simples (fotógrafo define e compartilha)
  
  -- Expiração
  expires_at timestamp with time zone NOT NULL,
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired')),
  
  -- Métricas
  views_count integer DEFAULT 0,
  photos_count integer DEFAULT 0,
  downloads_count integer DEFAULT 0,
  total_size_bytes bigint DEFAULT 0,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Slug único por profile
  UNIQUE(profile_id, slug)
);

-- Tabela: gallery_photos (Fotos da galeria)
CREATE TABLE public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid REFERENCES public.galleries(id) ON DELETE CASCADE NOT NULL,
  
  -- Arquivos
  file_path text NOT NULL,        -- Caminho no bucket privado
  file_url text NOT NULL,         -- URL pública (signed URL gerada dinamicamente)
  thumbnail_url text,             -- Miniatura para grid
  
  -- Metadata
  filename text NOT NULL,
  file_size integer DEFAULT 0,
  width integer,
  height integer,
  
  -- Organização
  order_index integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Galleries: Dono gerencia tudo
CREATE POLICY "Owners can manage their galleries"
  ON public.galleries FOR ALL
  USING (auth.uid() = profile_id);

-- Galleries: Público pode ver galerias ativas não expiradas
CREATE POLICY "Public can view active galleries"
  ON public.galleries FOR SELECT
  USING (status = 'active' AND expires_at > now());

-- Photos: Dono gerencia tudo
CREATE POLICY "Owners can manage gallery photos"
  ON public.gallery_photos FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.galleries 
    WHERE id = gallery_photos.gallery_id 
    AND profile_id = auth.uid()
  ));

-- Photos: Público pode ver fotos de galerias ativas
CREATE POLICY "Public can view photos of active galleries"
  ON public.gallery_photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.galleries 
    WHERE id = gallery_photos.gallery_id 
    AND status = 'active' 
    AND expires_at > now()
  ));

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_galleries_updated_at
  BEFORE UPDATE ON public.galleries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Bucket privado para fotos originais
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('gallery-photos', 'gallery-photos', false, 52428800); -- 50MB limit

-- Bucket público para thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('gallery-thumbnails', 'gallery-thumbnails', true, 5242880); -- 5MB limit

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- gallery-photos: Upload/Delete pelo dono
CREATE POLICY "Users can upload gallery photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their gallery photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'gallery-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their gallery photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gallery-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- gallery-photos: Leitura restrita (via signed URLs na edge function)
CREATE POLICY "Users can view their own gallery photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'gallery-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- gallery-thumbnails: Upload/Delete pelo dono
CREATE POLICY "Users can upload gallery thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-thumbnails' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their gallery thumbnails"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'gallery-thumbnails' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their gallery thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gallery-thumbnails' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- gallery-thumbnails: Leitura pública
CREATE POLICY "Anyone can view gallery thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-thumbnails');

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_galleries_profile_id ON public.galleries(profile_id);
CREATE INDEX idx_galleries_status ON public.galleries(status);
CREATE INDEX idx_galleries_expires_at ON public.galleries(expires_at);
CREATE INDEX idx_gallery_photos_gallery_id ON public.gallery_photos(gallery_id);
CREATE INDEX idx_gallery_photos_order ON public.gallery_photos(gallery_id, order_index);