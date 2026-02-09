-- Add chat customization columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN show_category_chips BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN show_story_carousel BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN luma_initial_message TEXT DEFAULT 'Olá! Sou a Luma ✨ Aqui contamos histórias através de imagens. Qual tipo de fotografia você procura hoje?',
ADD COLUMN luma_avatar_url TEXT,
ADD COLUMN luma_status TEXT DEFAULT 'Online';

-- Add show_in_carousel column to stories table
ALTER TABLE public.stories 
ADD COLUMN show_in_carousel BOOLEAN NOT NULL DEFAULT true;

-- Add comments to explain the columns
COMMENT ON COLUMN public.profiles.show_category_chips IS 'Toggle visibility of category suggestion buttons in chat';
COMMENT ON COLUMN public.profiles.show_story_carousel IS 'Toggle visibility of story thumbnails carousel in chat';
COMMENT ON COLUMN public.profiles.luma_initial_message IS 'Custom welcome message for Luma assistant';
COMMENT ON COLUMN public.profiles.luma_avatar_url IS 'Custom avatar URL for Luma assistant';
COMMENT ON COLUMN public.profiles.luma_status IS 'Custom status text for Luma assistant (e.g., Online, Typing)';
COMMENT ON COLUMN public.stories.show_in_carousel IS 'Whether this story appears in the chat carousel';