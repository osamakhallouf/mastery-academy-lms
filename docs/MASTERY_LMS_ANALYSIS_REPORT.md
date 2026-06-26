# Mastery LMS — Full-Stack Analysis Report

**Document version:** 1.0  
**Scope:** Entire `mastery-lms` workspace (app, components, lib, prisma, API routes)  
**Business context:** Platform for students to browse courses, submit applications, and **book seats for in-person/offline courses** at physical locations — **not** an e‑commerce site for selling online video courses.

---

## 1. Project Overview & Business Logic

### 1.1 Core Idea (As Implemented in Code)

The codebase currently implements a **hybrid model**:

- **Public / student-facing:** Browse published courses (home, search), view course detail pages with a **hardcoded “Training Calendar”** (date/city/status), request **enterprise proposals** (corporate inquiry form), download **PDF brochures** (with lead capture: name, phone), and contact via **WhatsApp**. There is **no UI** that lets a student “book a seat” or “enroll” for an offline cohort.
- **Backend (unused from main UI):** Full **Stripe checkout** and **Purchase** model exist: one-time payment creates a `Purchase` record; webhook creates enrollment. **No page or button** in the student flow links to this checkout. Dashboard and chapter access assume “purchased” = paid via Stripe.
- **Teacher:** Single teacher (Clerk `userId` in `TEACHER_USER_ID` / `NEXT_PUBLIC_TEACHER_USER_ID`). Creates/edits courses (chapters, attachments, price, category, publish), views **Corporate Inquiries**, issues **Confirmation Letters** (participants, location, time, course date, fees), and sees **Analytics** (revenue/sales from `Purchase`).

So in practice: **browse + enterprise inquiry + brochure + WhatsApp** are the main student flows; **Stripe/Purchase** is built but not exposed in the primary UI. The platform is **not yet** modeled around “book a seat for an offline cohort” (no cohort/session/booking entities or statuses).

### 1.2 Student Flow (From the Code)

1. **Home (`/`)** — Public. Lists published courses (with category filter), hero, industry categories, trust logos, “Latest Programs” (first 8 courses). No auth required to view.
2. **Course detail (`/courses/[courseId]`)** — Public. Course info, “Training Calendar” (hardcoded schedule), sidebar with:
   - **Request Enterprise Proposal** → POST `/api/corporate-inquiry` (creates `CorporateInquiry`), toast + thank-you.
   - **Download PDF Brochure** → POST brochure API with name/phone → creates `Lead`, returns signed PDF URL + optional WhatsApp link.
   - “Request In-House Training” links to WhatsApp.
3. **Search/Browse (`/search`)** — **Auth required** (redirect if no `userId`). Categories + search by title; `CoursesList` → `CourseCard` links to `/courses/[id]`. No checkout or booking button.
4. **Dashboard (`/dashboard`)** — **Auth required.** Shows “My courses” from **purchases** (Stripe): in progress / completed counts, list of purchased courses with progress. No booking or application list here.
5. **Chapter page (`/courses/[courseId]/chapters/[chapterId]`)** — **Auth required.** Access = **purchase** OR **free chapter**. If locked: “Request Enterprise Proposal” (WhatsApp). If access: video (Mux), attachments, progress button.

There is **no** flow in the UI for “apply for a cohort” or “book a seat” for an offline run; only corporate inquiry and brochure.

### 1.3 Teacher Flow (From the Code)

1. **Post-auth** — If `isTeacher(userId)` → redirect to `/teacher/courses`, else `/dashboard`.
2. **Teacher layout** — All `/teacher/*` routes protected: `isTeacher(userId)`; else redirect to `/`.
3. **Teacher courses (`/teacher/courses`)** — Data table of teacher’s courses (by `userId`); create new course via API.
4. **Course setup (`/teacher/courses/[courseId]`)** — Edit title, description, author, image, category, price, chapters (with Mux video), attachments; publish/unpublish. Copy still says “Sell your course” (online-product framing).
5. **Corporate Inquiries (`/teacher/corporate-inquiries`)** — List all `CorporateInquiry` with course, contact, Pending/Confirmed; link to create or view **Confirmation Letter**.
6. **Confirmation Letter (`/teacher/corporate-inquiries/[inquiryId]/confirmation`)** — Form: participants, location, time, course date, total fees; creates `ConfirmationLetter` linked to inquiry.
7. **Analytics (`/teacher/analytics`)** — Revenue and sales from **Purchase** (Stripe), grouped by course. No analytics for inquiries or bookings.

---

## 2. Tech Stack & Infrastructure

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14.2.x (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Neon); Prisma 5.18 |
| **Auth** | Clerk 5.x (`@clerk/nextjs`) |
| **Payments** | Stripe (checkout session, webhook) |
| **Video** | Mux (upload + playback: `@mux/mux-node`, `@mux/mux-player-react`) |
| **File upload** | UploadThing |
| **Email** | Resend |
| **Rate limiting** | Upstash Redis (optional; falls back to in-memory) |
| **UI** | Tailwind CSS, Radix-based components (shadcn-style: dialog, dropdown, table, form, etc.), Lucide icons |
| **Forms** | react-hook-form, @hookform/resolvers, Zod |
| **Charts** | Recharts |
| **Tables** | @tanstack/react-table |
| **Drag-and-drop** | @hello-pangea/dnd (chapter reorder) |
| **Rich text** | Quill / react-quill (chapter description, etc.) |
| **PDF** | Custom PDF generation in brochure route; jsPDF referenced in project |
| **Other** | query-string, date-fns, axios, react-hot-toast, react-confetti, zustand, cmdk/react-cmdk |

**Infrastructure / env:**  
`DATABASE_URL`, Stripe keys, Clerk keys, `NEXT_PUBLIC_APP_URL`, optional: Upstash Redis, Resend, Mux, `TEACHER_USER_ID` / `NEXT_PUBLIC_TEACHER_USER_ID`, `BROCHURE_SIGNING_SECRET`, `ADMIN_EMAIL`.  
CSP in `next.config.mjs` (script-src, frame-src, worker-src for Clerk).

---

## 3. Database Architecture

### 3.1 Schema Overview (`prisma/schema.prisma`)

- **Course** — `id`, `userId` (teacher), `title`, `author`, `description`, `imageUrl`, `price`, `isPublished`, `categoryId`; relations: `Category`, `Chapter[]`, `Attachment[]`, `Purchase[]`, `Lead[]`, `CorporateInquiry[]`.
- **Category** — `id`, `name` (unique); many courses.
- **Chapter** — `id`, `title`, `description`, `videoUrl`, `position`, `isPublished`, `isFree`, `content`; `courseId` → Course; optional `MuxData`; `UserProgress[]`.
- **MuxData** — `assetId`, `playbackId`; 1:1 with Chapter.
- **Attachment** — `name`, `url`; belongs to Course.
- **UserProgress** — `userId`, `chapterId`, `isCompleted`; unique on `(userId, chapterId)`.
- **Purchase** — `userId`, `courseId`, `stripeSessionId` (optional, unique); unique on `(userId, courseId)`. Used as “enrollment” after Stripe payment.
- **StripeCustomer** — `userId` (unique), `StripeCustomerId` (unique).
- **Rating** — `userId`, `courseId`, `rating`; unique on `(userId, courseId)`.
- **Lead** — `name`, `company`, `email`, `phone`, optional `courseId`; from brochure download / lead capture.
- **CorporateInquiry** — `name`, `email`, `companyName`, `phone`, `employeesCount`, `location`, `message`, optional `courseId`; optional 1:1 **ConfirmationLetter**.
- **ConfirmationLetter** — `inquiryId` (unique), `participants[]`, `location`, `time`, `courseDate`, `totalFees`.

### 3.2 How “Purchases” / “Enrollments” Work Today

- **Creation:** Only via **Stripe**: checkout session with `metadata: { userId, courseId }`; on `checkout.session.completed` webhook, a **Purchase** is created (idempotent by `stripeSessionId` or `userId+courseId`).
- **Usage:**  
  - Dashboard: “My courses” = courses that have a `Purchase` for the current user.  
  - Chapter access: allowed if user has a `Purchase` for the course **or** chapter is `isFree`.  
  - Attachments, progress, ratings: require `Purchase` (or owner) where implemented.
- **No UI to create Purchase:** No “Buy” or “Enroll” button in the main student flow; checkout API exists but is never linked from the app. So “enrollment” is effectively **unused** in the primary UX.

### 3.3 Fit for “Offline Course Booking”

- **Missing concepts:**  
  - No **Cohort / Session / Run** (e.g. date range, location, capacity).  
  - No **Booking** or **Application** (e.g. user applied for a cohort, status: pending/approved/cancelled).  
  - No **physical location** or **venue** on Course or a new entity.  
- **Current “schedule”:** The “Training Calendar” on the course page is **hardcoded** in the component (e.g. `schedule = [{ date, city, status }]`), not stored in the DB.  
- **ConfirmationLetter** is the closest to “booking confirmation” (participants, location, time, course date, fees) but is tied to **CorporateInquiry**, not to a student “seat” or a specific cohort.

---

## 4. Complete UI & Page Mapping

### 4.1 Public / Student UI

| Route | Auth | Purpose | Main actions / components |
|-------|------|--------|---------------------------|
| `/` | No | Landing + course list | Categories, “Latest Programs” (8 courses), industry sections, trust slider; `PublicNavbar`, `CoursesList` (links to `/courses/[id]`), `MobileSearchToggle`, `WhatsAppFloat`. |
| `/courses/[courseId]` | No | Course detail | Course hero, description, learning points, **hardcoded Training Calendar**, sidebar: **CourseCta** = “Request Enterprise Proposal” (dialog → POST corporate-inquiry) + “Download PDF Brochure” (dialog → name/phone → Lead + signed PDF). “Request In-House Training” → WhatsApp. |
| `/sign-in`, `/sign-up` | No | Clerk auth | Clerk hosted UI; rate-limited in middleware. |
| `/search` | Yes | Browse (post-login) | Categories, `SearchInput`, `CoursesList`; links to `/courses/[id]`. No checkout or booking. |
| `/dashboard` | Yes | My learning | “In Progress” / “Completed” from purchases; `CoursesList` of purchased courses with progress. |
| `/courses/[courseId]/chapters/[chapterId]` | Yes | Chapter view | Access by purchase or free chapter. **VideoPlayer** (Mux), attachments links, **CourseProgressButton** (mark complete); if locked, **CourseEnrollButton** (WhatsApp “Request Enterprise Proposal”). |

**Not present:** No page for “My applications” or “My bookings”; no “Book a seat” or “Apply for cohort” on course or calendar.

### 4.2 Teacher Dashboard (`/teacher/...`)

| Route | Purpose | Main actions / components |
|-------|---------|----------------------------|
| `/teacher/courses` | List teacher’s courses | Data table; create course (POST `/api/courses`). |
| `/teacher/courses/[courseId]` | Course setup | Title, description, author, image, category, **chapters** (reorder, Mux video, publish/free), **price**, **attachments**, publish/unpublish **Actions**. |
| `/teacher/courses/[courseId]/chapters/[chapterId]` | Chapter edit | Title, description, video, access (free/paid), reorder, delete. |
| `/teacher/create` | Create course | Entry to create new course. |
| `/teacher/corporate-inquiries` | Inquiries list | All `CorporateInquiry`; status Pending/Confirmed; link to confirmation. |
| `/teacher/corporate-inquiries/[inquiryId]/confirmation` | Confirmation letter | Form: participants, location, time, course date, total fees; create/update `ConfirmationLetter`. |
| `/teacher/analytics` | Revenue/sales | Total revenue, total sales, chart by course (from **Purchase**). |

**Shared:** Teacher layout enforces `isTeacher(userId)`; sidebar (when on `/teacher/*`) shows Courses, Corporate Inquiries, Analytics.

### 4.3 Key Components (Summary)

- **Public:** `PublicNavbar`, `NavbarRoutes` (Sign In / UserButton / Teacher mode), `SearchInput`, `CoursesList`, `CourseCard`, `CourseCta`, `CourseDetailsTabs`, `WhatsAppFloat`, `MobileSearchToggle`.
- **Dashboard:** `Navbar`, `Sidebar`, `SidebarRoutes` (guest vs teacher routes), `CoursesList`, `InfoCard`.
- **Teacher:** Data table + columns for courses, forms (title, description, image, category, price, chapters, attachments), chapter list with DnD, `Actions` (publish/unpublish).
- **Shared UI:** Radix-based dialog, button, input, table, etc.; `Banner`, `Preview` (rich text), `VideoPlayer`, `FileUpload`, `Editor`.

---

## 5. Security, Auth & Role Management

### 5.1 Clerk Integration

- **Middleware:** `clerkMiddleware` on all non-static routes; rate limit (e.g. 10/min) on `/sign-in`, `/sign-up`.
- **Auth in routes:** `auth()` or `currentUser()` from `@clerk/nextjs/server`; redirect or 401 when `!userId`.
- **Layout:** Root `ClerkProvider` with publishable key and sign-in/sign-up URLs from env. No route-level Clerk config in middleware (e.g. public vs protected paths are enforced per page/layout).

### 5.2 Teacher Role

- **Definition:** `isTeacher(userId)` in `lib/teacher.ts`: `userId === env.TEACHER_USER_ID` (server: from `TEACHER_USER_ID` or `NEXT_PUBLIC_TEACHER_USER_ID`; client: from `NEXT_PUBLIC_TEACHER_USER_ID` / `NEXT_PUBLIC_TEACHER_ID` only).
- **Usage:**  
  - **Teacher layout:** Redirect to `/` if `!isTeacher(userId)`.  
  - **API routes (teacher-only):** e.g. POST `/api/courses`, categories, course/chapter/attachment CRUD, publish/unpublish, reorder: check `userId` and `isTeacher(userId)`; 401 otherwise.  
  - **UploadThing:** `isTeacher(userId)` for course attachments.  
  - **Corporate confirmation API:** `isTeacher(userId)` required.
- **No RBAC:** Single teacher ID; no “admin” or multiple teachers in schema.

### 5.3 API Route Protection (Summary)

- **Teacher-only:** Courses CRUD, categories CRUD, chapters, attachments, publish/unpublish, reorder, corporate-inquiry confirmation, uploadthing. All use `auth()` + `isTeacher(userId)`.
- **Authenticated user:** Checkout, progress, ratings, dashboard data, chapter access (via `getChapter` which checks purchase/free).
- **Public (with rate limit):** Corporate inquiry POST, brochure POST/GET (signed URL for GET).
- **Webhook:** Stripe signature verification via `STRIPE_WEBHOOK_SECRET`; no user auth.

**Gaps:** No CSRF layer on state-changing public APIs (relying on rate limit and validation). Brochure GET is protected by signed URL only.

---

## 6. Performance & Optimization

### 6.1 SSR vs Client Components

- **Server components:** Most pages (home, course detail, search, dashboard, teacher list/setup, corporate inquiries, analytics). Data fetched in async page/layout; minimal client JS.
- **Client components:** Navbar/sidebar routes, `CourseCta` (dialogs, form submit), `CourseEnrollButton`, `CourseProgressButton`, `SearchInput`, `VideoPlayer`, teacher forms (all form state and mutations), file upload, drag-and-drop, charts. Appropriate for interactivity.
- **Env on client:** `lib/env.ts` uses `getClientEnv()` on client (no server-only validation) so that navbar/teacher button can read `NEXT_PUBLIC_TEACHER_USER_ID` (or `NEXT_PUBLIC_TEACHER_ID`) without loading server secrets.

### 6.2 Potential Bottlenecks

- **N+1 / bulk loads:** `get-dashboard-courses` loads purchases then fetches progress in a separate query (by chapter ids); acceptable. `get-courses` uses `include` with purchases and userProgress; single query per page.
- **No caching layer:** No React Cache or unstable_cache around course list or course-by-id; every request hits DB. For a single-teacher/small catalog this is fine; for scale, consider caching.
- **Heavy client deps:** Recharts, Quill, Mux player, UploadThing, DnD on teacher pages — ensure these are only loaded on routes that need them (dynamic imports where it makes sense).
- **Brochure PDF:** Built on-demand (no CDN); fine for low volume.
- **Full-text search:** Prisma schema has `@@fullTextSearch` commented out; search is `contains` (case-insensitive) on title only.

### 6.3 Unused or Redundant

- **Checkout flow:** Implemented but not linked; if the product is “offline booking only”, Stripe/Purchase could be removed or repurposed.
- **Rating:** Requires purchase; if purchases are unused in UI, rating is effectively unused.
- **Duplicate env vars:** `NEXT_PUBLIC_TEACHER_ID` and `NEXT_PUBLIC_TEACHER_USER_ID` both supported for teacher button; could standardize on one.

---

## 7. Gap Analysis & Strategic Recommendations

### 7.1 Alignment with “Offline Course Booking”

The system is **not** built around “book a seat for an in-person course.” Current state:

- **Course** = one catalog entry (with optional price and Stripe purchase).
- **No** cohort/session (date, venue, capacity).
- **No** booking/application (user → cohort, status).
- **“Training Calendar”** is hardcoded UI, not data.
- **Corporate flow** = inquiry → confirmation letter (participants, location, date, fees), which is closer to B2B proposals than to student self-service seat booking.

### 7.2 Missing Features / Data (Actionable)

1. **Cohorts / Sessions**
   - Add model(s), e.g. **CourseRun** or **Cohort**: `courseId`, `startDate`, `endDate`, `location` (or `venueId`), `capacity`, `status` (draft/open/full/cancelled). Optionally `time`, `timezone`.
   - Move “Training Calendar” data into DB and drive the course page from it (and optionally a dedicated “Schedule” or “Book” page).

2. **Bookings / Applications**
   - Add **Booking** (or **EnrollmentRequest**): `userId`, `courseId`, `cohortId` (or run id), `status` (pending/approved/rejected/cancelled), `createdAt`, optional `approvedAt` / `rejectedAt`.
   - Student UI: “Book a seat” or “Apply” per cohort; “My bookings” (and optionally “My applications”) with status.
   - Teacher/admin: list bookings per cohort, approve/reject (and optionally send confirmation email or letter).

3. **Location / Venue**
   - Add **Venue** (or embed on cohort): name, address, city, country, optional map link. Link cohort to venue (or store location text on cohort).
   - Show venue/location on course page calendar and on confirmation/booking details.

4. **Course page CTA**
   - Replace or complement “Request Enterprise Proposal” with **“Book a seat”** / **“Apply for this cohort”** when cohorts exist: link to cohort selection or booking form (and optionally keep enterprise proposal for corporate flows).

5. **Dashboard**
   - Add “My bookings” / “My applications”: list bookings with course, cohort, date, status, and link to details or confirmation.

6. **Confirmation letter**
   - Optionally link **ConfirmationLetter** to a **Booking** (e.g. one confirmation per booking or per inquiry) so that “confirmed” is reflected in booking status and in student-facing views.

### 7.3 Refactors to Consider

- **Stripe / Purchase:** If the business is “offline booking only,” either remove Stripe/Purchase and rely on Booking status (e.g. approved = “enrolled”) or keep Stripe for deposits/fees and add a **Booking** that references payment (e.g. `stripePaymentIntentId` or keep `Purchase` for “paid” and add Booking for “seat”).
- **Teacher copy:** Change “Sell your course” and “Sell your course” sections to “Pricing” or “Fees” and frame around cohorts/fees rather than “selling” an online product.
- **Search/dashboard:** When cohorts exist, allow filter by date/location; show next upcoming run on course cards.
- **Analytics:** Add metrics for inquiries, bookings (by status), and cohort fill rate; keep or drop revenue from Stripe depending on payment model.

### 7.4 Schema Additions (Suggested)

```prisma
// Optional: physical venue
model Venue {
  id        String   @id @default(uuid())
  name      String
  address   String?  @db.Text
  city      String?
  country   String?
  courseRuns CourseRun[]
}

// Cohort / run of a course (in-person)
model CourseRun {
  id          String   @id @default(uuid())
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  startDate   DateTime
  endDate     DateTime?
  location    String?  @db.Text   // or venueId
  capacity    Int?
  status      String   @default("draft")  // draft | open | full | cancelled
  bookings    Booking[]
  @@index([courseId])
  @@index([startDate])
}

// Student booking / application for a seat
model Booking {
  id          String   @id @default(uuid())
  userId      String
  courseId    String
  courseRunId String
  courseRun   CourseRun @relation(fields: [courseRunId], references: [id], onDelete: Cascade)
  status      String   @default("pending")  // pending | approved | rejected | cancelled
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([userId, courseRunId])
  @@index([courseRunId])
  @@index([userId])
}
```

Then: drive “Training Calendar” from `CourseRun`; add “Book a seat” → create/update `Booking`; show “My bookings” from `Booking`; teacher approves/rejects and can still use ConfirmationLetter for approved bookings if desired.

---

## Summary

- **What the codebase is today:** A Next.js 14 app with Clerk, Prisma/Postgres, Stripe (unused in main UI), Mux, and UploadThing. Main student flows are **browse → corporate inquiry + brochure + WhatsApp**. Teacher manages courses (with chapters/videos/attachments/price), corporate inquiries, and confirmation letters; analytics are from Stripe purchases.
- **What’s missing for “offline course booking”:** Cohorts/runs, bookings/applications, venue/location data, and UI for “book a seat” and “my bookings.” The current “Training Calendar” is hardcoded; Purchase/Stripe is implemented but not used in the primary student journey.
- **Recommended direction:** Introduce **CourseRun** (and optionally **Venue**), **Booking**, and status flow; move calendar to DB; add “Book a seat” and “My bookings”; then optionally retire or repurpose Stripe/Purchase and align teacher copy and analytics with an offline-booking model.
