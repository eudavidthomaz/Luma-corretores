-- Corrigir search_path da função increment_gallery_counter para evitar vulnerabilidade
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;