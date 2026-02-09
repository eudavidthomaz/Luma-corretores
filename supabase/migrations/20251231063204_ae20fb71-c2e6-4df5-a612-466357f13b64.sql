-- Add slug column to profiles for personalized URLs
ALTER TABLE public.profiles
ADD COLUMN slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX idx_profiles_slug ON public.profiles(slug);

-- Update existing profiles with a default slug based on id (first 8 chars)
UPDATE public.profiles 
SET slug = LOWER(REPLACE(business_name, ' ', '-')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;