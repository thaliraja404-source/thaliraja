export interface Restaurant {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  maps_url: string | null;
  opening_time: string | null;
  closing_time: string | null;
  opening_hours_weekdays: string | null;
  opening_hours_weekends: string | null;
  opening_hours_days: string | null;
  cover_image_url: string | null;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  emoji: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
