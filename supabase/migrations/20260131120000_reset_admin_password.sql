-- Reset password for admin user (Datta@gmail.com)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower('Datta@gmail.com')) THEN
    UPDATE auth.users
    SET encrypted_password = crypt('Datta@1122', gen_salt('bf')),
        updated_at = now()
    WHERE lower(email) = lower('Datta@gmail.com');
  ELSE
    RAISE NOTICE 'Admin user not found: Datta@gmail.com';
  END IF;
END $$;
