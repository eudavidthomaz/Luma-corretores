-- 1. Adicionar novos valores ao enum plan_type
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'trial';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'lite';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'ultra';

-- 2. Adicionar coluna trial_ends_at
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT NULL;

-- 3. Atualizar função handle_new_user para novos usuários começarem em trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, avatar_url, plan, trial_ends_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'business_name', 'Meu Estúdio'),
    new.raw_user_meta_data ->> 'avatar_url',
    'trial',
    now() + interval '7 days'
  );
  RETURN new;
END;
$$;