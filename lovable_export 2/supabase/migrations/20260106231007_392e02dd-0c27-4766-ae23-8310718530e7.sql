-- Create category_groups table
CREATE TABLE public.category_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.category_groups(id) ON DELETE CASCADE NOT NULL,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  color text DEFAULT 'gray',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Categories are public read
CREATE POLICY "Category groups are viewable by everyone" ON public.category_groups FOR SELECT USING (true);
CREATE POLICY "Category groups are manageable by admins" ON public.category_groups FOR ALL USING (false);

CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories are manageable by admins" ON public.categories FOR ALL USING (false);

-- Add category_id columns to stories and leads (nullable for migration)
ALTER TABLE public.stories ADD COLUMN category_id uuid REFERENCES public.categories(id);
ALTER TABLE public.leads ADD COLUMN interest_category_id uuid REFERENCES public.categories(id);

-- Insert category groups
INSERT INTO public.category_groups (slug, name, icon, order_index) VALUES
  ('familia-ciclos', 'Família e Ciclos', '👶', 1),
  ('eventos-sociais', 'Eventos Sociais', '🎉', 2),
  ('sazonais', 'Sazonais', '📅', 3),
  ('corporativo-branding', 'Corporativo e Branding', '👔', 4),
  ('nichos-especificos', 'Nichos Específicos', '🎨', 5);

-- Insert categories for Família e Ciclos
INSERT INTO public.categories (group_id, slug, name, color, order_index)
SELECT id, 'gestante', 'Gestante', 'rose', 1 FROM public.category_groups WHERE slug = 'familia-ciclos'
UNION ALL
SELECT id, 'parto', 'Parto', 'red', 2 FROM public.category_groups WHERE slug = 'familia-ciclos'
UNION ALL
SELECT id, 'newborn', 'Newborn', 'amber', 3 FROM public.category_groups WHERE slug = 'familia-ciclos'
UNION ALL
SELECT id, 'acompanhamento-mensal', 'Acompanhamento Mensal', 'orange', 4 FROM public.category_groups WHERE slug = 'familia-ciclos'
UNION ALL
SELECT id, 'smash-the-cake', 'Smash the Cake', 'yellow', 5 FROM public.category_groups WHERE slug = 'familia-ciclos'
UNION ALL
SELECT id, 'batizado', 'Batizado / Primeira Comunhão', 'sky', 6 FROM public.category_groups WHERE slug = 'familia-ciclos'
UNION ALL
SELECT id, 'familia-lifestyle', 'Família Lifestyle', 'emerald', 7 FROM public.category_groups WHERE slug = 'familia-ciclos';

-- Insert categories for Eventos Sociais
INSERT INTO public.categories (group_id, slug, name, color, order_index)
SELECT id, 'casamento', 'Casamento', 'pink', 1 FROM public.category_groups WHERE slug = 'eventos-sociais'
UNION ALL
SELECT id, 'pre-wedding', 'Pré-Wedding', 'violet', 2 FROM public.category_groups WHERE slug = 'eventos-sociais'
UNION ALL
SELECT id, '15-anos', '15 Anos / Debutante', 'fuchsia', 3 FROM public.category_groups WHERE slug = 'eventos-sociais'
UNION ALL
SELECT id, 'aniversario-infantil', 'Aniversário Infantil', 'lime', 4 FROM public.category_groups WHERE slug = 'eventos-sociais'
UNION ALL
SELECT id, 'aniversario-adulto', 'Aniversário Adulto', 'teal', 5 FROM public.category_groups WHERE slug = 'eventos-sociais'
UNION ALL
SELECT id, 'formatura', 'Formatura', 'indigo', 6 FROM public.category_groups WHERE slug = 'eventos-sociais';

-- Insert categories for Sazonais
INSERT INTO public.categories (group_id, slug, name, color, order_index)
SELECT id, 'dia-das-maes', 'Dia das Mães', 'pink', 1 FROM public.category_groups WHERE slug = 'sazonais'
UNION ALL
SELECT id, 'dia-dos-pais', 'Dia dos Pais', 'blue', 2 FROM public.category_groups WHERE slug = 'sazonais'
UNION ALL
SELECT id, 'natal', 'Natal', 'red', 3 FROM public.category_groups WHERE slug = 'sazonais'
UNION ALL
SELECT id, 'dia-dos-namorados', 'Dia dos Namorados', 'rose', 4 FROM public.category_groups WHERE slug = 'sazonais'
UNION ALL
SELECT id, 'pascoa', 'Páscoa', 'amber', 5 FROM public.category_groups WHERE slug = 'sazonais'
UNION ALL
SELECT id, 'dia-das-criancas', 'Dia das Crianças', 'cyan', 6 FROM public.category_groups WHERE slug = 'sazonais';

-- Insert categories for Corporativo e Branding
INSERT INTO public.categories (group_id, slug, name, color, order_index)
SELECT id, 'retrato-corporativo', 'Retrato Corporativo', 'slate', 1 FROM public.category_groups WHERE slug = 'corporativo-branding'
UNION ALL
SELECT id, 'branding-pessoal', 'Branding Pessoal', 'purple', 2 FROM public.category_groups WHERE slug = 'corporativo-branding'
UNION ALL
SELECT id, 'eventos-corporativos', 'Eventos Corporativos', 'zinc', 3 FROM public.category_groups WHERE slug = 'corporativo-branding'
UNION ALL
SELECT id, 'gastronomia', 'Gastronomia', 'orange', 4 FROM public.category_groups WHERE slug = 'corporativo-branding'
UNION ALL
SELECT id, 'imobiliario', 'Imobiliário / Arquitetura', 'stone', 5 FROM public.category_groups WHERE slug = 'corporativo-branding'
UNION ALL
SELECT id, 'produtos-ecommerce', 'Produtos / E-commerce', 'neutral', 6 FROM public.category_groups WHERE slug = 'corporativo-branding';

-- Insert categories for Nichos Específicos
INSERT INTO public.categories (group_id, slug, name, color, order_index)
SELECT id, 'esportivo', 'Esportivo', 'green', 1 FROM public.category_groups WHERE slug = 'nichos-especificos'
UNION ALL
SELECT id, 'pet', 'Pet', 'amber', 2 FROM public.category_groups WHERE slug = 'nichos-especificos'
UNION ALL
SELECT id, 'boudoir', 'Boudoir / Ensaios Sensuais', 'rose', 3 FROM public.category_groups WHERE slug = 'nichos-especificos'
UNION ALL
SELECT id, 'moda-editorial', 'Moda / Editorial', 'fuchsia', 4 FROM public.category_groups WHERE slug = 'nichos-especificos';

-- Migrate existing stories.category enum to category_id
UPDATE public.stories SET category_id = (
  SELECT c.id FROM public.categories c WHERE c.slug = 
    CASE stories.category::text
      WHEN 'casamento' THEN 'casamento'
      WHEN 'newborn' THEN 'newborn'
      WHEN 'familia' THEN 'familia-lifestyle'
      WHEN 'corporativo' THEN 'retrato-corporativo'
      WHEN 'moda' THEN 'moda-editorial'
      WHEN 'gastronomia' THEN 'gastronomia'
      WHEN 'gestante' THEN 'gestante'
      WHEN 'evento' THEN 'aniversario-adulto'
      WHEN 'preweeding' THEN 'pre-wedding'
    END
);

-- Migrate existing leads.interest_category enum to interest_category_id
UPDATE public.leads SET interest_category_id = (
  SELECT c.id FROM public.categories c WHERE c.slug = 
    CASE leads.interest_category::text
      WHEN 'casamento' THEN 'casamento'
      WHEN 'newborn' THEN 'newborn'
      WHEN 'familia' THEN 'familia-lifestyle'
      WHEN 'corporativo' THEN 'retrato-corporativo'
      WHEN 'moda' THEN 'moda-editorial'
      WHEN 'gastronomia' THEN 'gastronomia'
      WHEN 'gestante' THEN 'gestante'
      WHEN 'evento' THEN 'aniversario-adulto'
      WHEN 'preweeding' THEN 'pre-wedding'
    END
) WHERE interest_category IS NOT NULL;