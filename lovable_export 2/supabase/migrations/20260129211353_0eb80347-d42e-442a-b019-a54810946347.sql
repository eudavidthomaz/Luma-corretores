-- Corrigir políticas da tabela proposals para serem PERMISSIVE
DROP POLICY IF EXISTS "Owners can manage proposals" ON proposals;
CREATE POLICY "Owners can manage proposals" ON proposals
  FOR ALL
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Corrigir políticas da tabela proposal_items para serem PERMISSIVE
DROP POLICY IF EXISTS "Owners can manage items" ON proposal_items;
CREATE POLICY "Owners can manage items" ON proposal_items
  FOR ALL
  TO authenticated
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