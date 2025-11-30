-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  message TEXT NOT NULL,
  date_soumission TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lu BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Gestionnaires can view all messages
CREATE POLICY "Gestionnaires can view all contact messages"
ON public.contact_messages
FOR SELECT
USING (has_role(auth.uid(), 'gestionnaire'::app_role));

-- Policy: Gestionnaires can update messages (mark as read)
CREATE POLICY "Gestionnaires can update contact messages"
ON public.contact_messages
FOR UPDATE
USING (has_role(auth.uid(), 'gestionnaire'::app_role));

-- Policy: Anyone can insert contact messages (public form)
CREATE POLICY "Anyone can insert contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_contact_messages_date ON public.contact_messages(date_soumission DESC);
CREATE INDEX idx_contact_messages_lu ON public.contact_messages(lu);