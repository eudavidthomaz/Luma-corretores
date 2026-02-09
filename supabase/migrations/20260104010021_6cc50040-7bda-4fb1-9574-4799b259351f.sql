-- Add Google Calendar connection fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS google_calendar_connected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS google_calendar_connected_at timestamp with time zone;