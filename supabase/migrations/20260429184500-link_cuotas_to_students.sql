-- Add student_id to cuotas table for better linking
ALTER TABLE public.cuotas ADD COLUMN student_id UUID REFERENCES public.students(id) ON DELETE SET NULL;

-- Update existing cuotas to link with students by name (best effort)
UPDATE public.cuotas c
SET student_id = s.id
FROM public.students s
WHERE c.alumna = s.full_name AND c.user_id = s.user_id;

-- Add index for performance
CREATE INDEX idx_cuotas_student_id ON public.cuotas(student_id);
