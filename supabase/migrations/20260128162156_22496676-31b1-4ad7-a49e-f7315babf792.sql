-- Create inquiries table for messages/doubts about events and opportunities
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  -- Reference either event or opportunity
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  -- Status tracking
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure either event_id or opportunity_id is set
  CONSTRAINT inquiry_target_check CHECK (
    (event_id IS NOT NULL AND opportunity_id IS NULL) OR
    (event_id IS NULL AND opportunity_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Senders can view their own inquiries
CREATE POLICY "Users can view their own inquiries"
ON public.inquiries FOR SELECT
USING (auth.uid() = sender_id);

-- Users can create inquiries
CREATE POLICY "Authenticated users can create inquiries"
ON public.inquiries FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Event owners can view inquiries for their events
CREATE POLICY "Event owners can view their event inquiries"
ON public.inquiries FOR SELECT
USING (
  event_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM events e
    JOIN colleges c ON e.college_id = c.id
    WHERE e.id = inquiries.event_id AND c.user_id = auth.uid()
  )
);

-- Company owners can view inquiries for their opportunities
CREATE POLICY "Company owners can view their opportunity inquiries"
ON public.inquiries FOR SELECT
USING (
  opportunity_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM opportunities o
    JOIN companies c ON o.company_id = c.id
    WHERE o.id = inquiries.opportunity_id AND c.user_id = auth.uid()
  )
);

-- Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries"
ON public.inquiries FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Event/opportunity owners can update inquiry status
CREATE POLICY "Owners can update inquiry status"
ON public.inquiries FOR UPDATE
USING (
  (event_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM events e
    JOIN colleges c ON e.college_id = c.id
    WHERE e.id = inquiries.event_id AND c.user_id = auth.uid()
  )) OR
  (opportunity_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM opportunities o
    JOIN companies c ON o.company_id = c.id
    WHERE o.id = inquiries.opportunity_id AND c.user_id = auth.uid()
  )) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_inquiries_updated_at
BEFORE UPDATE ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();