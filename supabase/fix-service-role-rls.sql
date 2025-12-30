-- Fix RLS policy untuk allow service role create orders

-- Drop existing INSERT policy for orders
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- Create new policy that allows both authenticated users and service role
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (
    -- Allow if user owns the order (authenticated)
    auth.uid() = user_id 
    -- Allow service role (when auth.uid() is null)
    OR auth.uid() IS NULL
  );

-- Keep existing SELECT policy
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Similar fix for order_items - allow service role to insert
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;

CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT WITH CHECK (
    -- Service role can insert (auth.uid() is NULL)
    auth.uid() IS NULL
    -- Or user owns the order
    OR EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Allow cart deletion for service role
DROP POLICY IF EXISTS "Users can delete from own cart" ON cart_items;

CREATE POLICY "Users can delete from own cart" ON cart_items
  FOR DELETE USING (
    auth.uid() IS NULL OR auth.uid() = user_id
  );
