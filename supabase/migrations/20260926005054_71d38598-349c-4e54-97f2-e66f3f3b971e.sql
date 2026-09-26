ALTER TABLE public.applications
  ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN title TEXT, ADD COLUMN first_name TEXT, ADD COLUMN surname TEXT,
  ADD COLUMN date_of_birth DATE, ADD COLUMN gender TEXT, ADD COLUMN nationality TEXT,
  ADD COLUMN home_language TEXT, ADD COLUMN address TEXT, ADD COLUMN city TEXT, ADD COLUMN postal_code TEXT,
  ADD COLUMN guardian_name TEXT, ADD COLUMN guardian_relationship TEXT, ADD COLUMN guardian_phone TEXT, ADD COLUMN guardian_email TEXT,
  ADD COLUMN disability TEXT, ADD COLUMN matric_year TEXT, ADD COLUMN exam_body TEXT,
  ADD COLUMN subjects JSONB NOT NULL DEFAULT '[]'::jsonb, ADD COLUMN aps INTEGER,
  ADD COLUMN first_choice TEXT, ADD COLUMN second_choice TEXT, ADD COLUMN third_choice TEXT,
  ADD COLUMN preferred_institutions TEXT, ADD COLUMN funding TEXT,
  ADD COLUMN submitted BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.applications ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN id_number DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN grade_status DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN reference_code SET DEFAULT ('CCS-' || upper(substr(md5(random()::text), 1, 6)));

DROP POLICY "anyone can submit" ON public.applications;
REVOKE INSERT ON public.applications FROM anon;
CREATE POLICY "own application read" ON public.applications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own application insert" ON public.applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own application update" ON public.applications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.owns_application(_app UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.applications WHERE id = _app AND user_id = auth.uid())
$$;
REVOKE ALL ON FUNCTION public.owns_application(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_application(uuid) TO authenticated;

DROP POLICY "anyone can attach documents" ON public.application_documents;
REVOKE INSERT ON public.application_documents FROM anon;
CREATE POLICY "own documents read" ON public.application_documents FOR SELECT TO authenticated USING (public.owns_application(application_id));
CREATE POLICY "own documents insert" ON public.application_documents FOR INSERT TO authenticated WITH CHECK (public.owns_application(application_id));
CREATE POLICY "own documents delete" ON public.application_documents FOR DELETE TO authenticated USING (public.owns_application(application_id));
CREATE POLICY "own eligibility read" ON public.eligibility_results FOR SELECT TO authenticated USING (public.owns_application(application_id));
CREATE POLICY "own updates read" ON public.application_updates FOR SELECT TO authenticated USING (public.owns_application(application_id));

DROP POLICY "anyone can upload learner documents" ON storage.objects;
CREATE POLICY "students upload own files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'learner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "students read own files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'learner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "students delete own files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'learner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  IF lower(NEW.email) = 'sitholenathi817@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;