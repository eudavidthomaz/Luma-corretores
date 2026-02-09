-- Add minisite_avatar_url column for separating minisite photo from Luma/admin photo
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS minisite_avatar_url text;