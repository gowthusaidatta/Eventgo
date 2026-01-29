-- Security fixes for warn-level issues

-- 1. Add admin SELECT policy on payments table (payments_no_admin_policy)
CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 2. Add admin management policies for profiles, colleges, companies (admin_role_check_client)
-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update any college (for verification, active status)
CREATE POLICY "Admins can update all colleges"
ON public.colleges FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update any company (for verification, active status)
CREATE POLICY "Admins can update all companies"
ON public.companies FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- 3. Add rate limiting on inquiries via RLS (no_rate_limiting)
-- Replace the existing insert policy with one that includes rate limiting
DROP POLICY IF EXISTS "Authenticated users can create inquiries" ON public.inquiries;

CREATE POLICY "Authenticated users can create inquiries with rate limit"
ON public.inquiries FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND NOT EXISTS (
    SELECT 1 FROM public.inquiries
    WHERE sender_id = auth.uid()
    AND created_at > now() - interval '1 minute'
  )
);

-- 4. Add admin SELECT policy on registrations for oversight
CREATE POLICY "Admins can view all registrations"
ON public.registrations FOR SELECT
USING (has_role(auth.uid(), 'admin'));