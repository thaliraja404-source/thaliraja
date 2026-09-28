ALTER TABLE restaurants 
  ADD COLUMN description TEXT,
  ADD COLUMN tagline TEXT,
  ADD COLUMN opening_hours_weekdays TEXT,
  ADD COLUMN opening_hours_weekends TEXT,
  ADD COLUMN opening_hours_days TEXT,
  ADD COLUMN cover_image_url TEXT;

-- Create storage bucket for menus if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menus', 'menus', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for "menus" bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'menus');

CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'menus' 
  AND EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE TO authenticated 
USING (
  bucket_id = 'menus' 
  AND EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE TO authenticated 
USING (
  bucket_id = 'menus' 
  AND EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid())
);
