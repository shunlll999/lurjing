# เหลือจริง / LurJing

Seller Profit Copilot สำหรับร้านค้าออนไลน์ไทย

**Primary domain:** `lurjing.com`

## Stack

- Next.js 16.3.6
- React 19.2
- TypeScript
- App Router
- CSS (ไม่มี UI library dependency)
- LocalStorage สำหรับ Early data

## Run

```bash
npm install
npm run dev
```

เปิด `http://localhost:3000`

ตรวจ type:

```bash
npm run typecheck
```

Production build:

```bash
npm run build
npm start
```

## Routes

- `/` — Dashboard
- `/costs` — Platform Cost Breakdown
- `/products` — Product Profitability
- `/simulator` — Promotion Simulator
- `/ai-owner` — AI Owner Early
- `/import` — CSV Import

## CSV schema

```text
date,channel,sku,product,qty,revenue,cogs,commission,payment_fee,service_fee,affiliate,ads,discount,refunds
```

มีไฟล์ตัวอย่างที่ `public/sample-data.csv`

## Next step สำหรับ production

1. Auth: Clerk / Auth.js / custom SSO
2. Database: PostgreSQL + Prisma/Drizzle
3. Object storage สำหรับ raw statements
4. Background import jobs
5. Shopee / TikTok Shop / Lazada integrations
6. LLM tool-calling สำหรับ AI Owner
7. Billing
8. Audit log + reconciliation


## Dashboard charts

หน้า `/` มีกราฟสำหรับ Early แล้ว:

- Daily Revenue vs Real Profit
- Platform Cost Ratio แยก Platform fee / Ads / Affiliate / Discount + Refund

กราฟทำด้วย React + SVG/CSS โดยไม่เพิ่ม chart library เพื่อให้ Early เบาและแก้ต่อได้ง่าย

## Early v0.5 UX update

- Simulator: scenario presets, per-order money flow, break-even price, target 15% margin, projected impact by order volume
- Import: custom drag/drop upload UI, hidden native file input, schema guide, clear success/error states, responsive layout

## Responsive support v0.6

รองรับ:
- Large desktop
- Laptop / small desktop
- Tablet
- Mobile landscape / large phone
- Small phone
- Touch devices

Responsive ครอบคลุม Dashboard, charts, Cost page, Products table, Simulator, AI Owner และ Import.

## SaaS flow v0.7

Public:
- `/` Landing page
- `/login`
- `/register`
- `/terms`

Protected:
- `/dashboard`
- `/costs`
- `/products`
- `/simulator`
- `/ai-owner`
- `/import`
- `/profile`

### Demo account

- Email: `demo@lurjing.com`
- Password: `demo1234`

> Demo/Auth ในเวอร์ชัน Early ใช้ browser localStorage และ Web Crypto SHA-256 สำหรับบัญชีที่ผู้ใช้สมัครเอง ไม่ใช่ production authentication.

## Early v0.8

- Landing page: เพิ่ม Testimonial section สำหรับ Social Proof mockup (ระบุชัดว่าเป็นข้อความจำลอง)
- Promotion Simulator: เพิ่ม Product name + SKU และแสดงชื่อสินค้าในผลลัพธ์/Scale impact

## Early v0.9

- Desktop sidebar เปลี่ยนเป็น fixed เต็มความสูงของ viewport
- Main content มี offset 250px เพื่อไม่ซ้อนกับ sidebar
- Tablet/Mobile ยังใช้ sticky top navigation ตาม responsive เดิม

## Feedback + Testimonials v1.0

- `/feedback` สำหรับผู้ใช้ที่ล็อกอิน
- ให้คะแนน 1–5 ดาว
- เขียน Feedback ได้สูงสุด 600 ตัวอักษร
- เลือกได้ว่าจะอนุญาตให้แสดงบน Landing Page หรือไม่
- Landing Page จะแสดง Feedback จริงที่อนุญาตจาก LocalStorage
- หากยังไม่มี Feedback จริง ระบบใช้ Demo testimonials พร้อม label `DEMO`

## Admin + brand refresh v1.1

### Admin
- `/admin` Overview
- `/admin/users` User management
- `/admin/feedback` Approve / Reject / Feature testimonial
- `/admin/settings` Early settings + reset controls

Admin account:
- Email: `admin@lurjing.com`
- Password: `admin1234`

Landing testimonial จะแสดงเฉพาะ Feedback ที่ user อนุญาตและ Admin Approve แล้ว โดย Featured จะเรียงก่อน

### Brand refresh
- เพิ่ม custom SVG brand mark ที่สื่อถึงยอดขาย/กำไรด้วย bar + profit dot
- ใช้ visual language แบบ fintech/business tool มากกว่า AI assistant
- typography เปลี่ยนเป็น modern humanist/system stack: Sukhumvit Set / Avenir Next / Leelawadee UI / Noto Sans Thai

## Calm Commerce Theme v1.3

Visual direction:
- Light warm background instead of dark fintech styling
- Soft green / mint brand palette with yellow, peach, blue and lilac accents
- White cards, lighter borders and softer shadows
- Friendly active navigation and calmer chart colors
- Unified styling for Landing, Dashboard, Costs, Simulator, Import, AI Owner, Feedback, Profile, Auth and Admin
- Compact brand mark refreshed to a playful `LJ` identity
- Responsive behavior from previous versions retained

## Build fix v1.3.1

แก้ Next.js `typedRoutes: true` ที่หน้า login:

- `router.push()` ไม่รับ `string` ทั่วไปจาก query string อีกต่อไป
- เพิ่ม allowlist สำหรับ internal routes ที่อนุญาต
- login result จำกัด `destination` เป็น `/dashboard | /admin`
- `?next=` ที่ไม่อยู่ใน allowlist จะ fallback ไป `/dashboard`

จุดนี้แก้ error:
`Argument of type 'string' is not assignable to parameter of type 'RouteImpl<string>'`.

## Build fix v1.3.2

แก้ TypeScript inference ใน `AuthProvider.login()`:
- เพิ่ม `LoginDestination = "/dashboard" | "/admin"`
- เพิ่ม `LoginResult`
- บังคับ `login` ให้ใช้ type `AuthContextValue["login"]`
- บังคับ dynamic destination ให้เป็น `LoginDestination`
- type `useMemo` value เป็น `AuthContextValue`

แก้ error TS2322 ที่ `destination` ถูก infer เป็น `string`.


## Static Export + Firebase Hosting

โปรเจกต์ชุดนี้ตั้งค่าเป็น Next.js static export แล้ว

- `next.config.ts`
  - `output: "export"`
  - `trailingSlash: true`
  - `images.unoptimized: true`
  - ปิด `typedRoutes` เพื่อไม่ให้ Early ติดปัญหา dynamic router type
- `firebase.json`
  - deploy จากโฟลเดอร์ `out`
- `package.json`
  - `build`: `next build`

Build:

```bash
pnpm install
pnpm build
```

หลัง build สำเร็จจะได้โฟลเดอร์ `out/`

Deploy:

```bash
firebase login
firebase use --add
firebase deploy --only hosting
```

ไฟล์ `.firebaserc` ใช้ placeholder `YOUR_FIREBASE_PROJECT_ID` ให้เปลี่ยนหรือใช้ `firebase use --add` ก่อน deploy

## Firebase Auth + Firestore Profile + Real User Empty State v1.4

- Email/Password Register + Login through Firebase Authentication
- `users/{uid}` Firestore profile created on Register
- User can edit display name, store name, and phone from Profile
- Demo account uses mock seller data automatically
- Real users start with an empty Dashboard
- Real user imported seller data is namespaced by Firebase UID in browser storage
- Firestore Rules prevent normal users from changing role / plan / status / email
- Static export + Firebase Hosting remains enabled


## Product Analytics + Firestore Feedback v1.5

- GA4: route_view + ui_click
- Firestore important events: register, login, profile update, CSV import, feedback
- Admin analytics page: `/admin/analytics`
- Admin tracking switches: `/admin/settings`
- Feedback stored in Firestore
- Feedback visible to Admin
- Real feedback is not rendered on Landing Page yet
- Admin activity is excluded from analytics

## AI Owner Beta v1.6

- Rule-based Owner Copilot using the existing LurJing calculation engine.
- No LLM/API cost in this validation phase.
- Five suggested business questions based only on imported seller data.
- `ai_insight_requested` is stored as an Important Event so Admin can measure actual feature demand.
- See `AI_OWNER_BETA_v1.6.md`.

## Firestore Admin Users v1.7

- `/admin/users` reads real profiles from Firestore `users/{uid}`.
- Admin Overview user counts also come from Firestore.
- Admin can Activate / Deactivate normal app users.
- Deactivate updates `users/{uid}.status`; normal users are signed out in real time through a Firestore profile listener.
- Demo/Admin system accounts are protected in the Admin UI.
- Firebase Authentication deletion is intentionally not exposed from the browser; use Firebase Admin SDK / Cloud Functions for that later.

## v1.7.1 — Firestore Lite Performance Mode

The app now uses `firebase/firestore/lite` and no longer keeps Firestore realtime listeners open. Admin data is fetched one time on page load or manual Refresh. Normal users are checked with a throttled one-time status read when navigating protected routes.

## Cookie Consent / PDPA

- Global cookie consent banner with Necessary-only / Analytics consent.
- Consent is stored as a first-party cookie for 180 days; no localStorage is used for consent.
- Firebase/Google Analytics is not initialized until Analytics consent is granted.
- Firestore analytics events are skipped unless Analytics consent is granted.
- Users can reopen settings from the persistent “คุกกี้” badge.
- Public policy page: `/cookies`.


## Hero + Shop Profile Image

- Landing hero now highlights Early Access as FREE during the feedback period.
- Hero product preview uses a richer revenue / true-profit / margin chart.
- Registered users can upload a shop profile image from `/profile`.
- Images are stored in Firebase Storage; the URL/path remain in the Firestore user profile.
- App sidebar/topbar use the uploaded shop avatar when available.
