-- Table pour les conversations de chat
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id UUID NOT NULL,
  professeur_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(etudiant_id, professeur_id)
);

-- Table pour les messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  lu BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies pour chat_conversations
CREATE POLICY "Users can view their conversations" ON public.chat_conversations
FOR SELECT USING (
  auth.uid() = etudiant_id OR auth.uid() = professeur_id
);

CREATE POLICY "Students can create conversations with professors" ON public.chat_conversations
FOR INSERT WITH CHECK (
  auth.uid() = etudiant_id AND 
  has_role(professeur_id, 'professeur')
);

CREATE POLICY "Professors can create conversations with students" ON public.chat_conversations
FOR INSERT WITH CHECK (
  auth.uid() = professeur_id AND 
  has_role(auth.uid(), 'professeur')
);

-- Policies pour chat_messages
CREATE POLICY "Users can view messages in their conversations" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id
    AND (c.etudiant_id = auth.uid() OR c.professeur_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations" ON public.chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id
    AND (c.etudiant_id = auth.uid() OR c.professeur_id = auth.uid())
  )
);

CREATE POLICY "Users can update read status of messages" ON public.chat_messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id
    AND (c.etudiant_id = auth.uid() OR c.professeur_id = auth.uid())
  )
);

-- Trigger pour updated_at sur conversations
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index pour performance
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);

-- Activer realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;