CREATE POLICY "anyone can upload learner documents" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'learner-documents');
CREATE POLICY "staff read learner documents" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'learner-documents' AND public.is_staff(auth.uid()));
CREATE POLICY "staff delete learner documents" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'learner-documents' AND public.is_staff(auth.uid()));