# 🍽️ Thali Raja — Digital Menu & WhatsApp Ordering

**Fresh home-style food from Shivpuri, Madhya Pradesh.**

A mobile-first digital menu website that lets customers browse food, add items to a cart, and place orders directly on WhatsApp — no app, no login, no payment gateway needed.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/menu`.

---

## ⚙️ Configuration (Do This First!)

All restaurant settings are in **one file**: [`src/lib/config.ts`](src/lib/config.ts)

Update these before going live:

| Field | What to set |
|-------|-------------|
| `whatsappNumber` | WhatsApp number with country code, no `+` or spaces. Example: `919876543210` |
| `phone` | Display phone number. Example: `+91 98765 43210` |
| `openingHours.weekdays` | e.g. `8:00 AM – 10:00 PM` |
| `openingHours.weekends` | e.g. `7:30 AM – 10:30 PM` |
| `operatingHours` | 24-hour open/close times used for live open/closed status |

---

## 📋 Menu Data

All food items live in **one file**: [`src/data/menu.ts`](src/data/menu.ts)

To update the menu:
1. Open `src/data/menu.ts`
2. Edit/add/remove items following the `FoodItem` structure
3. For images: upload to any image host (Cloudinary free tier, ImgBB, etc.) and paste the URL in the `image` field — or put images in `/public/images/` and reference as `/images/filename.jpg`

```typescript
{
  id: "unique-id",          // must be unique
  name: "Dal Fry",
  description: "Yellow lentils with fresh tadka",
  price: 60,                // in ₹
  category: "sabji",        // thali | roti | sabji | rice | drinks | other
  image: "https://...",     // image URL
  isVeg: true,
  available: true,          // false = shown as "Currently Unavailable"
}
```

---

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/menu` |
| `/menu` | Full digital menu with categories, food cards, cart |
| `/order` | Cart review + customer info + WhatsApp order |
| `/info` | Restaurant info, hours, directions |
| `/admin` | Basic in-memory menu manager (V1) |

---

## 📲 QR Code Setup (for tables/counter)

1. **Deploy** the website (see Deployment section below)
2. **Copy** your `/menu` URL — e.g. `https://your-site.vercel.app/menu`
3. **Generate QR code** — use any free tool:
   - [qr-code-generator.com](https://www.qr-code-generator.com/)
   - [qrcode-monkey.com](https://www.qrcode-monkey.com/)
4. **Download** as PNG or SVG (high resolution)
5. **Print** — laminate if possible
6. **Place** on every table, counter, delivery package, and menu board

> **Tip:** Add a short label under the QR code like:
> *"Scan to see our menu & order on WhatsApp"*

---

## 🌐 Deployment (Free)

### Option 1: Vercel (Recommended — easiest)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Deploy — done! Free custom domain included (e.g. `thali-raja.vercel.app`)

### Option 2: Netlify
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Build command: `npm run build` | Publish dir: `.next`

### Option 3: Cloudflare Pages
1. Push to GitHub
2. Cloudflare Dashboard → Pages → Connect to Git
3. Framework preset: Next.js

No environment variables required for V1.

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (CartProvider, SEO, fonts)
│   ├── page.tsx            # Redirects to /menu
│   ├── globals.css         # Global styles + brand colors
│   ├── menu/
│   │   ├── page.tsx        # Menu page (category filter + food grid)
│   │   └── layout.tsx      # Menu metadata
│   ├── order/
│   │   ├── page.tsx        # Order page (cart + customer form + WhatsApp)
│   │   └── layout.tsx      # Order metadata
│   ├── info/
│   │   └── page.tsx        # Restaurant info page
│   └── admin/
│       └── page.tsx        # Basic admin menu manager (V1)
├── components/
│   ├── restaurant-header.tsx  # Sticky header with brand + open status
│   ├── category-tabs.tsx      # Horizontal scrollable category filter
│   ├── food-card.tsx          # Food item card with add/quantity controls
│   ├── cart-bar.tsx           # Sticky bottom cart summary bar
│   ├── cart-item.tsx          # Cart item row in order page
│   └── restaurant-info.tsx    # Info/contact section
├── context/
│   └── cart-context.tsx    # Cart state (React Context + useReducer)
├── data/
│   └── menu.ts             # ⭐ All menu items — edit this!
├── lib/
│   ├── config.ts           # ⭐ Restaurant config — edit this!
│   └── whatsapp.ts         # WhatsApp URL builder utility
└── types/
    ├── menu.ts             # FoodItem, Category types
    └── order.ts            # CartItem, CustomerInfo, Order types
```

---

## 🔮 Future Improvements (V2+)

When you're ready to expand:

- **Persistent menu management** — Connect `/admin` to a database (Supabase, PlanetScale free tier)
- **Order tracking** — Simple status page for customers
- **Image uploads** — Admin can upload food images directly
- **Analytics** — Simple view counter per item using Vercel Analytics (free)
- **PWA** — Add to home screen support
- **Online payment** — Razorpay/PhonePe integration

The code is structured so that `src/data/menu.ts` can be swapped for an API call with minimal changes.

---

## 📞 WhatsApp Order Flow

```
Customer scans QR → Browses /menu → Adds items → Goes to /order
→ Fills name + phone + order type → Taps "Order on WhatsApp"
→ WhatsApp opens with pre-filled message → Restaurant receives & confirms
```

The WhatsApp message format (from `src/lib/whatsapp.ts`):

```
Hello Thali Raja! 👋

I'd like to place an order:

1. Full Thali × 2 — ₹240
2. Masala Chai × 2 — ₹30

Total: ₹270

Name: Ramesh Kumar
Phone: 9876543210
Order type: Pickup 🛍️

Thank you! 🙏
```
