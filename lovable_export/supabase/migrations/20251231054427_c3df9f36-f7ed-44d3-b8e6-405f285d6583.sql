-- Create ENUM types
CREATE TYPE public.story_category AS ENUM ('casamento', 'newborn', 'familia', 'corporativo', 'moda', 'gastronomia', 'gestante', 'evento');
CREATE TYPE public.lead_status AS ENUM ('novo', 'em_contato', 'proposta_enviada', 'convertido', 'perdido');
CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'enterprise');

-- Create profiles table (photographers)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT '',
  niche TEXT DEFAULT 'Retratos',
  bio TEXT,
  avatar_url TEXT,
  whatsapp_number TEXT,
  plan plan_type NOT NULL DEFAULT 'free',
  leads_used_this_month INTEGER NOT NULL DEFAULT 0,
  leads_limit INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stories table (albums)
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category story_category NOT NULL,
  cover_image_url TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create story_chapters table (narrative)
CREATE TABLE public.story_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 1,
  narrative_text TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table (CRM)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  interest_category story_category,
  status lead_status NOT NULL DEFAULT 'novo',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_stories_profile_id ON public.stories(profile_id);
CREATE INDEX idx_stories_category ON public.stories(category);
CREATE INDEX idx_story_chapters_story_id ON public.story_chapters(story_id);
CREATE INDEX idx_story_chapters_order ON public.story_chapters(story_id, order_index);
CREATE INDEX idx_leads_profile_id ON public.leads(profile_id);
CREATE INDEX idx_leads_status ON public.leads(status);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for stories
CREATE POLICY "Published stories are viewable by everyone"
  ON public.stories FOR SELECT
  USING (is_published = true OR auth.uid() = profile_id);

CREATE POLICY "Users can insert own stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own stories"
  ON public.stories FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = profile_id);

-- RLS Policies for story_chapters
CREATE POLICY "Chapters are viewable with story access"
  ON public.story_chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE stories.id = story_chapters.story_id 
      AND (stories.is_published = true OR auth.uid() = stories.profile_id)
    )
  );

CREATE POLICY "Users can manage own story chapters"
  ON public.story_chapters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE stories.id = story_chapters.story_id 
      AND auth.uid() = stories.profile_id
    )
  );

CREATE POLICY "Users can update own story chapters"
  ON public.story_chapters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE stories.id = story_chapters.story_id 
      AND auth.uid() = stories.profile_id
    )
  );

CREATE POLICY "Users can delete own story chapters"
  ON public.story_chapters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE stories.id = story_chapters.story_id 
      AND auth.uid() = stories.profile_id
    )
  );

-- RLS Policies for leads
CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Anyone can insert leads (public form)"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = profile_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'business_name', 'Meu Estúdio'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for portfolio media
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-media', 'portfolio-media', true);

-- Storage policies for portfolio-media bucket
CREATE POLICY "Anyone can view portfolio media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-media');

CREATE POLICY "Authenticated users can upload portfolio media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own portfolio media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own portfolio media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio-media' AND auth.uid()::text = (storage.foldername(name))[1]);