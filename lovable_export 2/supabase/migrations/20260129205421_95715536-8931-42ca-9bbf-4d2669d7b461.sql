-- Dropar a política antiga
DROP POLICY IF EXISTS "Owners can manage items" ON proposal_items;

-- Recriar com WITH CHECK explícito para permitir INSERT
CREATE POLICY "Owners can manage items" ON proposal_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM proposals 
      WHERE proposals.id = proposal_items.proposal_id 
      AND proposals.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals 
      WHERE proposals.id = proposal_items.proposal_id 
      AND proposals.profile_id = auth.uid()
    )
  );