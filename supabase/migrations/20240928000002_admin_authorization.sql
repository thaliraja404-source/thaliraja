-- Create restaurant_admins table for authorization
CREATE TABLE restaurant_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

ALTER TABLE restaurant_admins ENABLE ROW LEVEL SECURITY;

-- Admins can view their own assignment
CREATE POLICY "Admins can view their own assignment" 
ON restaurant_admins FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Categories RLS for admins
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid() AND restaurant_id = categories.restaurant_id));

CREATE POLICY "Admins can update categories" ON categories FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid() AND restaurant_id = categories.restaurant_id))
WITH CHECK (EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid() AND restaurant_id = categories.restaurant_id));

CREATE POLICY "Admins can delete categories" ON categories FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid() AND restaurant_id = categories.restaurant_id));

-- Menu items RLS for admins
CREATE POLICY "Admins can insert menu_items" ON menu_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid() AND restaurant_id = menu_items.restaurant_id));

CREATE POLICY "Admins can update menu_items" ON menu_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid() AND restaurant_id = menu_items.restaurant_id))
WITH CHECK (EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid() AND restaurant_id = menu_items.restaurant_id));

CREATE POLICY "Admins can delete menu_items" ON menu_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM restaurant_admins WHERE user_id = auth.uid() AND restaurant_id = menu_items.restaurant_id));
