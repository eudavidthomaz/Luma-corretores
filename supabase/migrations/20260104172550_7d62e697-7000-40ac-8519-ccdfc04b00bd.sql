-- Update existing pre-wedding stories from casamento to preweeding
UPDATE stories 
SET category = 'preweeding' 
WHERE (LOWER(title) LIKE '%pré wed%' 
   OR LOWER(title) LIKE '%pre wed%' 
   OR LOWER(title) LIKE '%pre-wed%'
   OR LOWER(title) LIKE '%prewed%')
  AND category = 'casamento';