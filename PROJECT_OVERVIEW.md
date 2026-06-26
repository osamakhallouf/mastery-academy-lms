# تقرير فني: Mastery Academy LMS

مرجع تقني موحد لفهم بنية المشروع، التقنيات، قاعدة البيانات، الميزات والمسارات.

---

## 1. فكرة الموقع والجمهور المستهدف

**Mastery Academy LMS** منصة إدارة تعلم (LMS) تجمع بين:

- **التعلم الفردي (B2C):** دورات للأفراد مع شراء عبر Stripe، تتبع تقدم، وتقييمات.
- **تعلم الشركات (B2B):** نظام مخصص للشركات عبر نموذج طلبات، خطابات تأكيد PDF، وتنسيق الدورات (المكان، التاريخ، الرسوم، المشاركين).

**الجمهور المستهدف:**

| الفئة | الوصف |
|-------|--------|
| الطلاب | تصفح وشراء الدورات، متابعة الفصول، تسجيل التقدم. |
| المدرس/المدير | إنشاء وإدارة الدورات، الفصول، المرفقات، وعرض طلبات الشركات والتحليلات. |
| الشركات | تقديم طلبات تدريب، استلام خطابات تأكيد بالبريد. |

---

## 2. البنية التحتية (Tech Stack)

| الطبقة | التقنية |
|--------|----------|
| **Framework** | Next.js 14 (App Router) |
| **اللغة** | TypeScript |
| **قاعدة البيانات** | PostgreSQL (Neon)، مع Prisma ORM |
| **المصادقة** | Clerk (Auth) |
| **المدفوعات** | Stripe (Checkout + Webhooks) |
| **البريد** | Resend (إرسال إيميلات المعاملات وإشعارات طلبات الشركات) |
| **الفيديو** | Mux (رفع وتشغيل فيديوهات الفصول) |
| **التخزين/الملفات** | Uploadthing (صور، مرفقات) |
| **الواجهة** | Tailwind CSS، مكونات Shadcn UI، Radix UI |
| **النماذج والتحقق** | React Hook Form، Zod |
| **حد معدل الطلبات** | Upstash Redis (اختياري) |

---

## 3. هيكلية قاعدة البيانات (Schema Overview)

### الجداول الرئيسية والعلاقات

```
Category (1) ──────< Course
                        │
                        ├──< Chapter (فصول، فيديو، ترتيب، isFree/isPublished)
                        │       └── MuxData (معرّف Mux للفيديو)
                        │       └── UserProgress (تقدم المستخدم لكل فصل)
                        │
                        ├──< Attachment (مرفقات الكورس)
                        ├──< Purchase (شراء الطالب للكورس، ربط Stripe)
                        ├──< Lead (استفسارات/ليدرز مرتبطة بكورس)
                        ├──< CorporateInquiry (طلبات الشركات B2B)
                        └──< Rating (تقييمات الكورس)
```

### الجداول بالتفصيل

| الجدول | الغرض |
|--------|--------|
| **Course** | الكورس: عنوان، وصف، صورة، سعر، حالة النشر، تصنيف، ومعرّف المدرس `userId`. |
| **Category** | التصنيفات (مثل: برمجة، تسويق) لتنظيم الكورسات. |
| **Chapter** | فصل داخل كورس: عنوان، وصف، فيديو، ترتيب، مجاني/منشور، محتوى نصي. |
| **MuxData** | ربط الفصل بفيديو Mux (assetId, playbackId). |
| **UserProgress** | تقدم المستخدم لكل فصل (إكمال أم لا). علاقة فريدة (userId, chapterId). |
| **Attachment** | مرفق مرتبط بكورس (اسم، رابط). |
| **Purchase** | شراء كورس من مستخدم؛ ربط مع جلسة Stripe. علاقة فريدة (userId, courseId). |
| **StripeCustomer** | ربط مستخدم التطبيق بعميل Stripe (لإعادة استخدامه في الدفع). |
| **Rating** | تقييم كورس من مستخدم. علاقة فريدة (userId, courseId). |
| **Lead** | ليد/استفسار: اسم، شركة، إيميل، هاتف، كورس اختياري. |
| **CorporateInquiry** | طلب شركة: اسم، إيميل، شركة، هاتف، عدد الموظفين، موقع، رسالة، كورس اختياري. |
| **ConfirmationLetter** | خطاب تأكيد لطلب شركة: ربط 1:1 مع `CorporateInquiry`، تفاصيل (مشاركين، مكان، وقت، تاريخ الدورة، إجمالي الرسوم). |

### ملاحظات

- الحذف المتسلسل: حذف `Course` يحذف الفصول، المرفقات، MuxData، UserProgress، Purchase؛ ويُستخدم `SetNull` لـ Lead و CorporateInquiry.
- الفهارس: على `courseId`, `userId`, `categoryId`, `chapterId` لتسريع الاستعلامات.

---

## 4. الميزات الحالية (Core Features)

### 4.1 نظام الطلاب

- **الصفحة الرئيسية:** عرض الكورسات (واختياراً حسب التصنيف).
- **البحث / التصفح:** صفحة بحث وتصفية الكورسات.
- **صفحة الكورس:** عرض تفاصيل الكورس، الفصول، السعر، والشراء.
- **مشاهدة الفصول:** تشغيل الفيديو (Mux)، محتوى نصي، ومتابعة التقدم (تحديث `UserProgress`).
- **الشراء:** إنشاء جلسة Stripe من الطلب، إكمال الدفع عبر Webhook وتسجيل `Purchase`.
- **التقييم:** إرسال تقييم للكورس (API التقييمات).

### 4.2 نظام المدرس/المدير

- **التحقق من الصلاحية:** عبر `TEACHER_USER_ID` (Clerk)؛ نفس المستخدم يرى لوحة المدرس.
- **قائمة الكورسات:** `/teacher/courses` — عرض، إنشاء، تعديل، نشر/إلغاء نشر.
- **إدارة الكورس:** فصول (إضافة، تعديل، ترتيب، نشر/إلغاء)، مرفقات، رفع فيديو (Mux)، صور (Uploadthing).
- **طلبات الشركات:** `/teacher/corporate-inquiries` — عرض الطلبات، إنشاء خطاب تأكيد (PDF) وإرساله بالبريد.
- **التحليلات:** `/teacher/analytics` — إحصائيات ومقاييس متعلقة بالكورسات والمبيعات.

### 4.3 نظام الشركات (B2B)

- **نموذج الطلب:** صفحة مخصصة (مثل `/corporate-services`) لتقديم طلب شركة (البيانات المخزنة في `CorporateInquiry`).
- **خطاب التأكيد:** المدرس يدخل تفاصيل الخطاب (مشاركين، مكان، وقت، تاريخ، رسوم) ويُولَّد PDF عبر `lib/confirmation-letter.ts` (jsPDF).
- **الإرسال:** إرسال الخطاب بالبريد (Resend) إلى العميل؛ مع إمكانية رابط تحميل موقّع (Brochure signing) إن وُجدت الإعدادات.

---

## 5. المسارات (Routes Structure)

### صفحات الواجهة (App Router)

| المسار | الوصف |
|--------|--------|
| `/` | الصفحة الرئيسية — عرض الكورسات (والتصنيفات). |
| `/search` | البحث والتصفح — تصفية الكورسات. |
| `/dashboard` | لوحة الطالب بعد تسجيل الدخول. |
| `/courses/[courseId]` | صفحة كورس للطالب — التفاصيل، الفصول، زر الشراء. |
| `/courses/[courseId]/chapters/[chapterId]` | مشاهدة فصل — فيديو، محتوى، تتبع التقدم. |
| `/corporate-services` | نموذج طلب الشركات (B2B). |
| `/sign-in/[[...sign-in]]` | تسجيل الدخول (Clerk). |
| `/sign-up/[[...sign-up]]` | التسجيل (Clerk). |
| `/post-auth` | صفحة ما بعد المصادقة (إعادة توجيه). |
| **المدرس** | |
| `/teacher/courses` | قائمة كورسات المدرس — إدارة وإنشاء. |
| `/teacher/courses/[courseId]` | تحرير كورس — فصول، مرفقات، إعدادات. |
| `/teacher/courses/[courseId]/chapters/[chapterId]` | تحرير فصل — فيديو، محتوى، نشر. |
| `/teacher/create` | إنشاء كورس جديد. |
| `/teacher/corporate-inquiries` | قائمة طلبات الشركات. |
| `/teacher/corporate-inquiries/[inquiryId]/confirmation` | إنشاء وإرسال خطاب التأكيد للطلب. |
| `/teacher/analytics` | تحليلات المدرس. |

### واجهات برمجة التطبيقات (API Routes)

| المسار | الطريقة | الوصف |
|--------|---------|--------|
| `POST /api/corporate-inquiry` | POST | استقبال نموذج طلب شركة. |
| `GET/POST /api/corporate-inquiries/[inquiryId]/confirmation` | GET/POST | إنشاء/معالجة خطاب التأكيد وربطه بالطلب. |
| `GET/POST /api/courses` | GET/POST | قائمة الكورسات أو إنشاء كورس (مدرس). |
| `GET/PATCH/DELETE /api/courses/[courseId]` | GET/PATCH/DELETE | تفاصيل/تحديث/حذف كورس. |
| `POST /api/courses/[courseId]/publish` | POST | نشر الكورس. |
| `POST /api/courses/[courseId]/unpublish` | POST | إلغاء نشر الكورس. |
| `GET/POST /api/courses/[courseId]/chapters` | GET/POST | فصول الكورس أو إضافة فصل. |
| `PATCH/POST /api/courses/[courseId]/chapters/reorder` | PATCH/POST | إعادة ترتيب الفصول. |
| `GET/PATCH/DELETE /api/courses/[courseId]/chapters/[chapterId]` | GET/PATCH/DELETE | فصل واحد — تحديث/حذف. |
| `POST /api/courses/[courseId]/chapters/[chapterId]/publish` | POST | نشر الفصل. |
| `POST /api/courses/[courseId]/chapters/[chapterId]/unpublish` | POST | إلغاء نشر الفصل. |
| `POST /api/courses/[courseId]/chapters/[chapterId]/progress` | POST | تحديث تقدم المستخدم للفصل. |
| `GET/POST /api/courses/[courseId]/attachments` | GET/POST | مرفقات الكورس أو إضافة مرفق. |
| `DELETE /api/courses/[courseId]/attachments/[attachmentId]` | DELETE | حذف مرفق. |
| `GET /api/courses/[courseId]/attachments/[attachmentId]/download` | GET | تحميل مرفق (مع التحقق). |
| `POST /api/courses/[courseId]/checkout` | POST | إنشاء جلسة Stripe للشراء. |
| `GET /api/courses/[courseId]/brochure` | GET | رابط تحميل PDF موقّع للبروشور/خطاب (إن وُجد). |
| `GET/POST/DELETE /api/categories` | GET/POST/DELETE | التصنيفات. |
| `GET/PATCH/DELETE /api/categories/[categoryId]` | GET/PATCH/DELETE | تصنيف واحد. |
| `POST /api/webhook` | POST | Stripe Webhook — أحداث الدفع وتحديث `Purchase`. |
| `GET/POST /api/ratings` | GET/POST | تقييمات الكورسات. |
| `POST /api/uploadthing` | POST | رفع ملفات (Uploadthing). |
| `GET /api/health` | GET | فحص صحة التطبيق. |

---

## 6. إعدادات البيئة (Environment Variables)

يتم التحقق من المتغيرات في `lib/env.ts` عند بدء التطبيق (عبر استيراد `lib/db` أو `lib/stripe`).

### مطلوبة (بدونها التطبيق لا يعمل)

| المتغير | الغرض |
|---------|--------|
| `DATABASE_URL` | سلسلة اتصال PostgreSQL (مثل Neon). |
| `STRIPE_API_KEY` | المفتاح السري لـ Stripe (يبدأ بـ `sk_`). |
| `STRIPE_WEBHOOK_SECRET` | سر توقيع Webhook لـ Stripe (`whsec_...`). |
| `CLERK_SECRET_KEY` | المفتاح السري لـ Clerk (خادم). |
| `NEXT_PUBLIC_APP_URL` | الرابط الأساسي للتطبيق (مثل `https://example.com` أو `http://localhost:3000`). |

### اختيارية (لميزات محددة)

| المتغير | الغرض |
|---------|--------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | مفتاح Clerk العام (واجهة المستخدم). |
| `TEACHER_USER_ID` | معرّف مستخدم Clerk الذي يملك صلاحية المدرس. |
| `UPSTASH_REDIS_REST_URL` | عنوان REST لـ Upstash Redis (حد المعدل). |
| `UPSTASH_REDIS_REST_TOKEN` | توكن Upstash Redis. |
| `RESEND_API_KEY` | مفتاح Resend لإرسال البريد. |
| `ADMIN_EMAIL` | بريد استقبال إشعارات طلبات الشركات. |
| `MUX_TOKEN_ID` | معرف Mux لرفع/تشغيل الفيديو. |
| `MUX_TOKEN_SECRET` | سر Mux. |
| `BROCHURE_SIGNING_SECRET` | سر توقيع روابط تحميل PDF (خطابات/بروشور). |

---

*آخر تحديث: وصف مبني على بنية المشروع الحالية (Next.js 14، Prisma، Clerk، Stripe، Resend، Mux، Uploadthing).*
