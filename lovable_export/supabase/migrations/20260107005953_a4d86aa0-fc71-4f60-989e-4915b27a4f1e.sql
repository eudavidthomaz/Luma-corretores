-- Add custom_domain column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN custom_domain text;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.custom_domain IS 'Domínio personalizado do usuário para o widget (ex: chat.estudio.com.br)';