-- Fase 1.1: Adicionar coluna subscription_ends_at na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Fase 1.2: Criar função RPC para analytics (substitui Edge Function gallery-analytics)
CREATE OR REPLACE FUNCTION increment_gallery_counter(
  p_gallery_id UUID,
  p_counter_type TEXT
) RETURNS VOID AS $$
BEGIN
  IF p_counter_type = 'view' THEN
    UPDATE galleries 
    SET views_count = COALESCE(views_count, 0) + 1 
    WHERE id = p_gallery_id;
  ELSIF p_counter_type = 'download' THEN
    UPDATE galleries 
    SET downloads_count = COALESCE(downloads_count, 0) + 1 
    WHERE id = p_gallery_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permitir chamadas anônimas e autenticadas ao RPC
GRANT EXECUTE ON FUNCTION increment_gallery_counter TO anon, authenticated;