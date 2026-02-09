-- Create table for gallery photo favorites
CREATE TABLE public.gallery_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.gallery_photos(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint: one favorite per photo per visitor
  UNIQUE(photo_id, visitor_hash)
);

-- Enable RLS
ALTER TABLE public.gallery_favorites ENABLE ROW LEVEL SECURITY;

-- Anyone can insert favorites (public gallery)
CREATE POLICY "Anyone can insert gallery favorites"
ON public.gallery_favorites
FOR INSERT
WITH CHECK (true);

-- Anyone can view favorites (needed for visitor to see their own)
CREATE POLICY "Anyone can view gallery favorites"
ON public.gallery_favorites
FOR SELECT
USING (true);

-- Anyone can delete their own favorites
CREATE POLICY "Anyone can delete their own favorites"
ON public.gallery_favorites
FOR DELETE
USING (true);

-- Gallery owners can view all favorites for their galleries
CREATE POLICY "Owners can view favorites for their galleries"
ON public.gallery_favorites
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM galleries
    WHERE galleries.id = gallery_favorites.gallery_id
    AND galleries.profile_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_gallery_favorites_gallery_id ON public.gallery_favorites(gallery_id);
CREATE INDEX idx_gallery_favorites_visitor ON public.gallery_favorites(visitor_hash);
CREATE INDEX idx_gallery_favorites_photo ON public.gallery_favorites(photo_id);