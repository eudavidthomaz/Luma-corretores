-- Fix RLS policies for proposals table
-- The issue is that RESTRICTIVE policies require ALL to pass
-- We need PERMISSIVE for owner management so it works independently

-- Drop the restrictive owner policy
DROP POLICY IF EXISTS "Owners can manage proposals" ON public.proposals;

-- Recreate as PERMISSIVE (default when not specified as RESTRICTIVE)
CREATE POLICY "Owners can manage proposals"
  ON public.proposals
  FOR ALL
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Fix RLS policies for proposal_items table
DROP POLICY IF EXISTS "Owners can manage items" ON public.proposal_items;

-- Recreate as PERMISSIVE
CREATE POLICY "Owners can manage items"
  ON public.proposal_items
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.id = proposal_items.proposal_id 
    AND proposals.profile_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM proposals 
    WHERE proposals.id = proposal_items.proposal_id 
    AND proposals.profile_id = auth.uid()
  ));