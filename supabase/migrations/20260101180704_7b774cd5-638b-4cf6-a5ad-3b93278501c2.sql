-- Add new columns for mini-site customization (Ultra plan feature)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS action_buttons JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS about_photo_url TEXT,
ADD COLUMN IF NOT EXISTS about_video_url TEXT,
ADD COLUMN IF NOT EXISTS about_text TEXT,
ADD COLUMN IF NOT EXISTS minisite_cover_url TEXT,
ADD COLUMN IF NOT EXISTS minisite_theme TEXT DEFAULT 'dark';

-- Add comments for documentation
COMMENT ON COLUMN profiles.action_buttons IS 'Array of customizable action buttons: [{label, url, icon, isPrimary}]';
COMMENT ON COLUMN profiles.about_photo_url IS 'Personal photo for the About section';
COMMENT ON COLUMN profiles.about_video_url IS 'Optional presentation video URL';
COMMENT ON COLUMN profiles.about_text IS 'Extended presentation text';
COMMENT ON COLUMN profiles.minisite_cover_url IS 'Cover/hero image for the mini-site';
COMMENT ON COLUMN profiles.minisite_theme IS 'Visual theme: dark or light';