-- Fase 1: Adicionar novos campos para flexibilidade de itens
-- name: Nome curto do item
-- details: Descrição longa/detalhes do item
-- show_price: Se deve exibir o valor para o cliente

ALTER TABLE proposal_items
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS details TEXT,
  ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT true;

-- Migrar dados existentes: description → name (para manter compatibilidade)
UPDATE proposal_items SET name = description WHERE name IS NULL AND description IS NOT NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN proposal_items.name IS 'Nome curto do item (ex: Cobertura Fotográfica)';
COMMENT ON COLUMN proposal_items.details IS 'Descrição longa/detalhes do item';
COMMENT ON COLUMN proposal_items.show_price IS 'Se deve exibir o valor para o cliente (false = "Incluso")';