-- =============================================
-- FIX: ORDERS RELATIONSHIP
-- =============================================
-- Masalah: PostgREST tidak bisa join orders -> profiles 
-- karena orders.user_id refer ke auth.users (schema auth), bukan profiles (schema public)
-- Solusi: Ubah FK orders.user_id agar refer ke profiles.id

DO $$ 
BEGIN
  -- 1. Drop existing constraint (jika namanya beda, script ini akan handle errornya nanti)
  -- Kita coba drop constraint standard dulu
  BEGIN
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
  EXCEPTION
    WHEN undefined_object THEN 
      RAISE NOTICE 'Constraint orders_user_id_fkey not found, skipping drop';
  END;

  -- 2. Add new constraint referencing profiles
  ALTER TABLE orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE SET NULL;

  RAISE NOTICE 'Successfully updated orders foreign key to reference profiles table';
END $$;
