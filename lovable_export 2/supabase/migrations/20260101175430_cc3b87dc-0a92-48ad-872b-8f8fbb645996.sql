-- Update handle_new_user to generate automatic slug from business_name
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
  -- Generate base slug from business_name or fallback to id prefix
  base_slug := lower(regexp_replace(
    COALESCE(new.raw_user_meta_data ->> 'business_name', 'studio'),
    '[^a-zA-Z0-9]+', '-', 'g'
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- If empty, use id prefix
  IF base_slug = '' THEN
    base_slug := 'studio-' || substr(new.id::text, 1, 8);
  END IF;
  
  generated_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = generated_slug) LOOP
    counter := counter + 1;
    generated_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.profiles (id, business_name, avatar_url, plan, trial_ends_at, slug)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'business_name', 'Meu Estúdio'),
    new.raw_user_meta_data ->> 'avatar_url',
    'trial',
    now() + interval '7 days',
    generated_slug
  );
  RETURN new;
END;
$function$;