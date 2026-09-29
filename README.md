# เหลือจริง / LurJing

Seller Profit Copilot สำหรับร้านค้าออนไลน์ไทย

**Primary domain:** `lurjing.com`

<img width="538" height="376" alt="Screenshot 2569-09-29 at 18 54 49" src="https://github.com/user-attachments/assets/0c4e5117-d946-42bb-b55c-6c4145a9ecdd" />
<img width="1115" height="554" alt="Screenshot 2569-09-29 at 18 56 16" src="https://github.com/user-attachments/assets/d4724ca7-7b83-440e-9c96-945a920082d4" />


## Stack

- Next.js 16.3.6
- React 19.2
- TypeScript
- App Router
- CSS (ไม่มี UI library dependency)
- LocalStorage สำหรับ POC data

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
- `/ai-owner` — AI Owner POC
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

หน้า `/` มีกราฟสำหรับ POC แล้ว:

- Daily Revenue vs Real Profit
- Platform Cost Ratio แยก Platform fee / Ads / Affiliate / Discount + Refund

กราฟทำด้วย React + SVG/CSS โดยไม่เพิ่ม chart library เพื่อให้ POC เบาและแก้ต่อได้ง่าย

## POC v0.5 UX update

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

> Demo/Auth ในเวอร์ชัน POC ใช้ browser localStorage และ Web Crypto SHA-256 สำหรับบัญชีที่ผู้ใช้สมัครเอง ไม่ใช่ production authentication.

## POC v0.8

- Landing page: เพิ่ม Testimonial section สำหรับ Social Proof mockup (ระบุชัดว่าเป็นข้อความจำลอง)
- Promotion Simulator: เพิ่ม Product name + SKU และแสดงชื่อสินค้าในผลลัพธ์/Scale impact

## POC v0.9

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
- `/admin/settings` POC settings + reset controls

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
  - ปิด `typedRoutes` เพื่อไม่ให้ POC ติดปัญหา dynamic router type
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
