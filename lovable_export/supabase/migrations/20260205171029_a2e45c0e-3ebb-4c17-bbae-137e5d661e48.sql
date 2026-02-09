-- Adicionar 'pending' ao enum plan_type
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'pending';