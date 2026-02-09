-- Add 'preweeding' to story_category enum
ALTER TYPE story_category ADD VALUE IF NOT EXISTS 'preweeding';