-- Add emergency_phone and health_insurance columns to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
ADD COLUMN IF NOT EXISTS health_insurance TEXT;
