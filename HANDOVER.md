# Thali Raja - Owner Handover & Deployment Guide

This document outlines the final steps to deploy Thali Raja to production (for the developer) and the steps the restaurant owner will take to manage the restaurant (for the non-technical owner).

---

## Part 1: Developer Deployment Checklist (Vercel + Supabase)

Follow these exact steps to push this code live:

### 1. GitHub & Vercel Setup
- [ ] Push the entire repository to a new private GitHub repository.
- [ ] Go to [Vercel](https://vercel.com) and create a new project by importing your GitHub repository.
- [ ] In the Vercel **Environment Variables** settings, add the following exact keys (get these from your Supabase Dashboard -> Project Settings -> API):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  *(Note: You do **not** need to add the `SUPABASE_SERVICE_ROLE_KEY`. The app securely uses RLS and Server Actions without needing service role bypasses on the client/server!)*
- [ ] Click **Deploy**.

### 2. Supabase Configuration
- [ ] **Auth Redirects:** Go to your Supabase Dashboard -> **Authentication** -> **URL Configuration**.
  - Add your new Vercel production domain (e.g., `https://thali-raja.vercel.app`) to the **Site URL**.
  - Add `https://thali-raja.vercel.app/**` to the **Redirect URLs**. (If you skip this, admin login will fail in production).
- [ ] **Database Migrations:** Go to the **SQL Editor** in Supabase. You MUST execute the following SQL files (located in `supabase/migrations/`) in exact order:
  1. `20240928000001_initial_schema.sql` (Tables & RLS)
  2. `20240928000002_admin_authorization.sql` (Admin RLS)
  3. `20240928000003_add_menu_fields.sql` (Veg/Emoji schema)
  4. `20240928000004_restaurant_settings.sql` (Settings schema)
  5. `20240928000005_storage_setup.sql` (Creates `menus` image bucket)
- [ ] **Seed the Restaurant:** Execute `supabase/seed.sql` to create the root "Thali Raja" restaurant profile.

### 3. Create the Owner's Admin Account
- [ ] Go to the live Vercel URL: `https://thali-raja.vercel.app/admin/login`
- [ ] Because you haven't set up email sending (SMTP) in Supabase yet, sign up the owner manually:
  1. Go to Supabase Dashboard -> **Authentication** -> **Users** -> **Add User** -> **Create New User**.
  2. Enter their email (e.g., `owner@thaliraja.com`) and a secure password.
  3. **Auto-Confirm** the user so they don't need an email verification link.
- [ ] **Grant Admin Access:**
  1. Copy the newly created user's `UUID` from the Auth dashboard.
  2. Go to the **Table Editor** -> `restaurant_admins` table.
  3. Insert a new row:
     - `user_id`: [Paste the owner's UUID]
     - `restaurant_id`: `f47ac10b-58cc-4372-a567-0e02b2c3d479` (The ID from seed.sql).

---

## Part 2: Restaurant Owner's Management Guide

*Give this section to the restaurant owner.*

Welcome to the Thali Raja management dashboard! You can use this to control your entire digital menu straight from your phone or laptop. You do not need to touch any code or open Supabase.

### 1. Logging In
1. Go to your restaurant link (e.g., `https://thali-raja.vercel.app/admin`).
2. Log in using the email and password provided to you by your developer.

### 2. Managing the Menu
- **First Time Setup:** If your dashboard says "âš ï¸ Database not seeded", simply click the **Run Migration** button. This will instantly import the default starter menu into your live database.
- **Adding Items:** Click the blue **+ Add Item** button. You can type the name, price, description, and upload a real photo straight from your phone.
- **Out of Stock:** If a dish runs out for the day, just click the **âœ“ Available** button on that item to instantly hide it from the customer menu. Click it again tomorrow to bring it back.
- **Edits:** Notice a typo in a price? Click **Edit** on any item to change it instantly.

### 3. Changing Restaurant Info (Phone, WhatsApp, Hours)
1. In the admin dashboard, click the **Settings** button at the top right.
2. Here you can edit:
   - Your **WhatsApp Number** (CRITICAL: Ensure this is the correct number with the country code, e.g., `+919876543210`, so customer orders actually reach your phone!)
   - Your **Phone Number** (for standard calls)
   - Your **Address & Google Maps Link**
   - Your **Opening/Closing Times**
3. Need to close the restaurant for a holiday? Just uncheck the **"Currently Open for Orders"** toggle and click Save. Customers will see a "Closed" notice on the menu.

### 4. How You Receive Orders
Your customers will browse the menu, add items to their cart, and fill out their delivery/pickup details.
When they tap **Order on WhatsApp**, your restaurant's WhatsApp number will instantly receive a beautifully formatted message containing their entire order list, total bill, and address! You just reply to them to confirm.
