-- Alterar função handle_new_user para criar usuários com plan = 'pending'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  generated_slug text;
  base_slug text;
  counter integer := 0;
BEGIN
  -- Start with business name or email prefix for slug
  base_slug := LOWER(REGEXP_REPLACE(
    COALESCE(
      new.raw_user_meta_data ->> 'business_name',
      SPLIT_PART(new.email, '@', 1)
    ),
    '[^a-z0-9]+', '-', 'g'
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Ensure minimum length
  IF LENGTH(base_slug) < 3 THEN
    base_slug := 'studio-' || base_slug;
  END IF;

  generated_slug := base_slug;

  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = generated_slug) LOOP
    counter := counter + 1;
    generated_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.profiles (id, business_name, avatar_url, plan, trial_ends_at, slug)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'business_name', 'Meu Estúdio'),
    new.raw_user_meta_data ->> 'avatar_url',
    'pending',  -- ALTERADO: Novos usuários começam como pending (sem acesso)
    NULL,       -- ALTERADO: Sem data de expiração de trial
    generated_slug
  );
  RETURN new;
END;
$function$;