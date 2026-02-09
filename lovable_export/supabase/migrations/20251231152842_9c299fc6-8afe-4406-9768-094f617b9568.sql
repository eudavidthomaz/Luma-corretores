-- Create story_views table for tracking views
CREATE TABLE public.story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX idx_story_views_profile_id ON public.story_views(profile_id);
CREATE INDEX idx_story_views_viewed_at ON public.story_views(viewed_at);
CREATE INDEX idx_story_views_visitor_story ON public.story_views(visitor_hash, story_id);

-- Enable RLS
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (public tracking)
CREATE POLICY "Anyone can insert story views"
ON public.story_views
FOR INSERT
WITH CHECK (true);

-- Users can view their own story views
CREATE POLICY "Users can view own story views"
ON public.story_views
FOR SELECT
USING (auth.uid() = profile_id);

-- Add comment
COMMENT ON TABLE public.story_views IS 'Tracks individual story views for analytics';
COMMENT ON COLUMN public.story_views.visitor_hash IS 'Hashed visitor ID to avoid duplicate counts';