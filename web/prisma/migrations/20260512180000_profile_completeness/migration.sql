-- Profile completeness columns & RLS for public."UserProfile"

-- 1) ENUM for education level
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EducationLevel') THEN
    CREATE TYPE public."EducationLevel" AS ENUM (
      'HIGH_SCHOOL',
      'ASSOCIATES',
      'BACHELORS',
      'MASTERS',
      'DOCTORATE',
      'OTHER'
    );
  END IF;
END $$;

-- 2) Columns
ALTER TABLE public."UserProfile"
  ADD COLUMN IF NOT EXISTS "firstName" text,
  ADD COLUMN IF NOT EXISTS "lastName" text,
  ADD COLUMN IF NOT EXISTS "suffix" text,
  ADD COLUMN IF NOT EXISTS "street1" text,
  ADD COLUMN IF NOT EXISTS "street2" text,
  ADD COLUMN IF NOT EXISTS "city" text,
  ADD COLUMN IF NOT EXISTS "state" text,
  ADD COLUMN IF NOT EXISTS "postalCode" text,
  ADD COLUMN IF NOT EXISTS "country" text,
  ADD COLUMN IF NOT EXISTS "educationLevel" public."EducationLevel",
  ADD COLUMN IF NOT EXISTS "linkedInUrl" text;

-- 3) updatedAt trigger (for Supabase SQL; Prisma may also manage updatedAt at app-level)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_userprofile_updated_at ON public."UserProfile";
CREATE TRIGGER set_userprofile_updated_at
BEFORE UPDATE ON public."UserProfile"
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 4) Enable RLS
ALTER TABLE public."UserProfile" ENABLE ROW LEVEL SECURITY;

-- 5) RLS policies keyed by supabaseUserId == auth.uid()
DROP POLICY IF EXISTS "UserProfile select own" ON public."UserProfile";
CREATE POLICY "UserProfile select own"
ON public."UserProfile"
FOR SELECT
USING ("supabaseUserId" = auth.uid());

DROP POLICY IF EXISTS "UserProfile insert own" ON public."UserProfile";
CREATE POLICY "UserProfile insert own"
ON public."UserProfile"
FOR INSERT
WITH CHECK ("supabaseUserId" = auth.uid());

DROP POLICY IF EXISTS "UserProfile update own" ON public."UserProfile";
CREATE POLICY "UserProfile update own"
ON public."UserProfile"
FOR UPDATE
USING ("supabaseUserId" = auth.uid())
WITH CHECK ("supabaseUserId" = auth.uid());
