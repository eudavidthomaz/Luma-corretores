-- Seed data: Create 1 test profile and 4 varied stories with chapters
-- First, insert a test profile (using a fixed UUID for demo purposes)

INSERT INTO public.profiles (id, business_name, niche, bio, avatar_url, whatsapp_number, plan, leads_limit)
VALUES (
  '8a415d51-fe74-455c-bbad-150f295804f6',
  'After Fotografia',
  'Retratos',
  'Especializados em contar histórias através de imagens. Casamentos, famílias e momentos únicos.',
  NULL,
  '+5511999999999',
  'free',
  50
) ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  niche = EXCLUDED.niche,
  bio = EXCLUDED.bio;

-- Story 1: Casamento
INSERT INTO public.stories (id, profile_id, title, category, cover_image_url, views_count, is_published)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '8a415d51-fe74-455c-bbad-150f295804f6',
  'Casamento Ana & Pedro',
  'casamento',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1200&fit=crop',
  127,
  true
) ON CONFLICT (id) DO NOTHING;

-- Chapters for Casamento
INSERT INTO public.story_chapters (story_id, order_index, narrative_text, media_url, media_type)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'O grande dia começou com muita emoção. Ana se preparava cercada por suas damas, enquanto a expectativa tomava conta de todos.', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=1200&fit=crop', 'image'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 'A cerimônia foi ao ar livre, em um jardim repleto de flores. O momento do sim emocionou a todos os presentes.', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1200&fit=crop', 'image'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'A festa foi pura alegria! Música, dança e muito amor celebrando a união de duas almas.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=1200&fit=crop', 'image')
ON CONFLICT DO NOTHING;

-- Story 2: Newborn
INSERT INTO public.stories (id, profile_id, title, category, cover_image_url, views_count, is_published)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  '8a415d51-fe74-455c-bbad-150f295804f6',
  'O Primeiro Dia do Theo',
  'newborn',
  'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&h=1200&fit=crop',
  89,
  true
) ON CONFLICT (id) DO NOTHING;

-- Chapters for Newborn
INSERT INTO public.story_chapters (story_id, order_index, narrative_text, media_url, media_type)
VALUES 
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 1, 'Theo chegou ao mundo trazendo luz e alegria infinita. Cada detalhe dele é pura perfeição.', 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&h=1200&fit=crop', 'image'),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 2, 'Mãozinhas delicadas, bochechas fofas... Os primeiros dias são mágicos e merecem ser eternizados.', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&h=1200&fit=crop', 'image'),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 3, 'O amor dos pais é palpável em cada foto. Uma família completa, pronta para uma nova jornada.', 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=1200&fit=crop', 'image')
ON CONFLICT DO NOTHING;

-- Story 3: Corporativo
INSERT INTO public.stories (id, profile_id, title, category, cover_image_url, views_count, is_published)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  '8a415d51-fe74-455c-bbad-150f295804f6',
  'Campanha Tech Innovation',
  'corporativo',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=1200&fit=crop',
  64,
  true
) ON CONFLICT (id) DO NOTHING;

-- Chapters for Corporativo
INSERT INTO public.story_chapters (story_id, order_index, narrative_text, media_url, media_type)
VALUES 
  ('c3d4e5f6-a7b8-9012-cdef-345678901234', 1, 'A Tech Innovation precisava de imagens que traduzissem inovação e profissionalismo. Missão aceita.', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=1200&fit=crop', 'image'),
  ('c3d4e5f6-a7b8-9012-cdef-345678901234', 2, 'Retratos executivos que transmitem confiança e liderança. A equipe em seu melhor momento.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1200&fit=crop', 'image'),
  ('c3d4e5f6-a7b8-9012-cdef-345678901234', 3, 'O resultado? Uma identidade visual que eleva a marca e conecta com o público.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1200&fit=crop', 'image')
ON CONFLICT DO NOTHING;

-- Story 4: Gestante
INSERT INTO public.stories (id, profile_id, title, category, cover_image_url, views_count, is_published)
VALUES (
  'd4e5f6a7-b8c9-0123-def0-456789012345',
  '8a415d51-fe74-455c-bbad-150f295804f6',
  'A Espera da Sofia',
  'gestante',
  'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&h=1200&fit=crop',
  52,
  true
) ON CONFLICT (id) DO NOTHING;

-- Chapters for Gestante
INSERT INTO public.story_chapters (story_id, order_index, narrative_text, media_url, media_type)
VALUES 
  ('d4e5f6a7-b8c9-0123-def0-456789012345', 1, 'A barriga crescendo, o coração transbordando. Marina espera ansiosamente pela chegada de Sofia.', 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=1200&fit=crop', 'image'),
  ('d4e5f6a7-b8c9-0123-def0-456789012345', 2, 'Cada chutinho é uma lembrança de que logo ela estará nos braços. Um momento único de conexão.', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&h=1200&fit=crop', 'image'),
  ('d4e5f6a7-b8c9-0123-def0-456789012345', 3, 'O ensaio celebra a força feminina e o milagre da vida que está por vir.', 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&h=1200&fit=crop', 'image')
ON CONFLICT DO NOTHING;