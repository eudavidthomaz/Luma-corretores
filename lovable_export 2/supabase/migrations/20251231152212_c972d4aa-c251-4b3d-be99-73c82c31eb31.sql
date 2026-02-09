-- Add ai_context column to profiles for storing custom AI instructions
ALTER TABLE public.profiles 
ADD COLUMN ai_context TEXT;

-- Add a comment to explain the column purpose
COMMENT ON COLUMN public.profiles.ai_context IS 'Custom AI instructions and business context for personalized chat responses';