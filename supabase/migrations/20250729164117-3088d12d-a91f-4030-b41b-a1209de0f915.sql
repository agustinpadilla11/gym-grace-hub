-- Create storage buckets for medical certificates and student photos
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-certificates', 'medical-certificates', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('student-photos', 'student-photos', true);

-- Create policies for medical certificates bucket
CREATE POLICY "Medical certificates are viewable by everyone" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'medical-certificates');

CREATE POLICY "Users can upload medical certificates" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'medical-certificates' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update medical certificates" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'medical-certificates' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete medical certificates" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'medical-certificates' AND auth.uid() IS NOT NULL);

-- Create policies for student photos bucket
CREATE POLICY "Student photos are viewable by everyone" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'student-photos');

CREATE POLICY "Users can upload student photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'student-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update student photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'student-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete student photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'student-photos' AND auth.uid() IS NOT NULL);