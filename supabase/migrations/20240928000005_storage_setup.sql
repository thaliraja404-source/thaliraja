INSERT INTO storage.buckets (id, name, public) 
VALUES ('menus', 'menus', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to the menus bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'menus');

-- Allow authenticated admins to upload/modify images in the menus bucket
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'menus' 
  AND EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'menus' 
  AND EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'menus' 
  AND EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid())
);
