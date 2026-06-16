-- Add DIRECTOR and CEO to UserRole enum
-- Using DO block to safely add values only if they don't already exist

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'UserRole'::regtype
    AND enumlabel = 'DIRECTOR'
  ) THEN
    ALTER TYPE "UserRole" ADD VALUE 'DIRECTOR';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'UserRole'::regtype
    AND enumlabel = 'CEO'
  ) THEN
    ALTER TYPE "UserRole" ADD VALUE 'CEO';
  END IF;
END
$$;
