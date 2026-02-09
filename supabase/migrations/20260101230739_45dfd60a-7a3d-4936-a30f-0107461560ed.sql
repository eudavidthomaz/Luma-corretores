-- Adicionar coluna para preços estruturados
ALTER TABLE public.profiles 
ADD COLUMN pricing_packages jsonb DEFAULT '{"packages": [], "allow_luma_share": false}'::jsonb;

-- Comentário para documentação
COMMENT ON COLUMN public.profiles.pricing_packages IS 'Estrutura de preços: {packages: [{name, price, description, services[]}], allow_luma_share: boolean}';