-- Create table for conversation messages
CREATE TABLE public.conversation_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_conversation_messages_session ON public.conversation_messages(session_id);
CREATE INDEX idx_conversation_messages_profile ON public.conversation_messages(profile_id);

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert messages (from chat)
CREATE POLICY "Anyone can insert conversation messages"
  ON public.conversation_messages FOR INSERT
  WITH CHECK (true);

-- Photographers can view their own conversations
CREATE POLICY "Users can view own conversation messages"
  ON public.conversation_messages FOR SELECT
  USING (auth.uid() = profile_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;