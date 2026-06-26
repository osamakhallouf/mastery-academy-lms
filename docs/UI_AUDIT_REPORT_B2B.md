# تقرير مراجعة واجهة المستخدم (UI Audit) — منصة تدريب مؤسسي B2B

**الهدف:** التأكد من أن كل عناصر الواجهة متوافقة مع تحويل الموقع إلى **منصة تدريب مؤسسي B2B فقط**، والمسار الوحيد: **مشاهدة الكورس → فتح النموذج المؤسسي → إرسال الطلب**.

**تاريخ المراجعة:** 2025-02-22

---

## 1. قائمة الأزرار (Buttons Inventory)

### 1.1 Navbar (شريط التنقل العام)

| الموقع | الملف | الوصف | الحالة |
|--------|-------|--------|--------|
| `components/public-navbar.tsx` | سطر 65–71 | زر فتح القائمة (Menu) — أيقونة فقط | ✅ OK |
| `components/public-navbar.tsx` | سطر 76 | رابط "Home" → `/` | ✅ OK |
| `components/public-navbar.tsx` | سطر 80 | رابط "Corporate Services" → `/corporate-services` | ✅ OK |
| `components/public-navbar.tsx` | سطر 86 | رابط واتساب (رقم الهاتف) | ✅ OK |
| `components/navbar-routes.tsx` | سطر 28–32 | زر "Home" → `/` (للمسجلين) | ✅ OK |
| `components/navbar-routes.tsx` | سطر 35–38 | زر "Dashboard" للمدرب → `/teacher/courses` | ✅ OK |
| `components/navbar-routes.tsx` | سطر 44–55 | زر "Sign In" (Clerk) | ✅ OK |

**الخلاصة (Navbar):** لا توجد أزرار مرتبطة بطلب فردي أو شراء مباشر. جميع الروابط مناسبة لـ B2B.

---

### 1.2 Hero Section (الصفحة الرئيسية فقط)

| الموقع | الملف | الوصف | الحالة |
|--------|-------|--------|--------|
| `app/[locale]/page.tsx` | سطر 84 | `<a href="#upcoming-courses">` — التمرير للكورسات | ✅ OK |
| `app/[locale]/page.tsx` | سطر 87 | `<a href="#industry-categories">` — التمرير للتصنيفات | ✅ OK |
| `app/[locale]/page.tsx` | سطر 116 | `<a href="#upcoming-courses">` — نفس الهدف (قسم آخر) | ✅ OK |

**الخلاصة (Hero):** لا توجد أزرار شراء أو حجز فردي.

---

### 1.3 Course Page (صفحة الكورس)

| الموقع | الملف | الوصف | الحالة |
|--------|-------|--------|--------|
| `_components/course-cta.tsx` | سطر 138–141 | زر "طلب تدريب مؤسسي" — يفتح Dialog النموذج المؤسسي | ✅ OK |
| `_components/course-cta.tsx` | سطر 201–207 | زر "إرسال الطلب" داخل النموذج (POST → `/api/corporate-inquiry`) | ✅ OK |
| `_components/course-cta.tsx` | سطر 214–218 | زر "تحميل البروشور PDF" — يفتح Dialog بروشور | ✅ OK (مكمل للمسار المؤسسي) |
| `_components/course-cta.tsx` | سطر 241–247 | زر "تحميل" داخل dialog البروشور | ✅ OK |
| `_components/training-calendar.tsx` | سطر 101–107 | زر "طلب تدريب مؤسسي" (جدول Desktop) — يضبط `#corporate-request` | ✅ OK |
| `_components/training-calendar.tsx` | سطر 127–133 | زر "طلب تدريب مؤسسي" (جدول Mobile) — نفس السلوك | ✅ OK |
| `_components/course-details-tabs.tsx` | سطر 103–115 | أزرار التبويبات (About, Audience, Objectives, Outline) | ✅ OK |
| `_components/course-sidebar-item.tsx` | سطر 37–56 | زر/رابط الفصل في القائمة الجانبية (يتنقل بـ `#chapter-{id}`) | ✅ OK |

**الخلاصة (صفحة الكورس):** لا توجد أزرار حجز فردي أو شراء مباشر. زر "طلب تدريب مؤسسي" هو المسار الوحيد للطلب.

---

### 1.4 Calendar (جدول التدريب — داخل صفحة الكورس)

تم دمجها أعلاه تحت "Course Page". الأزرار الوحيدة في التقويم هي "طلب تدريب مؤسسي" وكلها تفتح النموذج المؤسسي عبر `#corporate-request`. ✅

---

### 1.5 أزرار إضافية في الموقع (جدول الكورسات القادمة، بطاقات، بحث)

| الموقع | الملف | الوصف | الحالة |
|--------|-------|--------|--------|
| `components/upcoming-training-table.tsx` | سطر 77–84 | زر "عرض التفاصيل" / "View Details" → `/courses/${course.id}` | ✅ OK (يؤدي لصفحة الكورس ثم النموذج المؤسسي) |
| `components/course-card.tsx` | — | البطاقة بالكامل `Link` → `/courses/${id}` (لا زر منفصل) | ✅ OK |

**خلاصة الأزرار:** لا يوجد أي زر مُوسوم بـ **Delete/Replace** لارتباطه بنظام الطلب الفردي أو الشراء المباشر في المناطق المطلوبة (Navbar, Hero, Course Page, Calendar).

---

## 2. تحليل الأيقونات (Icons Analysis)

الأيقونات التي قد توحي بـ "كورسات فيديو" أو "دراسة ذاتية" (قفل، عدد الدروس، شريط الإنجاز):

| الموقع بالضبط | الملف | السطور | الوصف | التوصية |
|---------------|-------|--------|--------|----------|
| أيقونة **القفل (Lock)** ونص "This chapter is locked" | `app/[locale]/(course)/courses/[courseId]/chapters/[chapterId]/_components/video-player.tsx` | 8, 18, 66–70 | عرض Lock عندما `isLocked === true` | **Delete/Replace**: المكوّن غير مستخدم (صفحة الفصل تعيد التوجيه لصفحة الكورس). إن بقي الكود للمستقبل، يفضّل إزالة فكرة "locked" أو استبدالها بنص مؤسسي (مثلاً "للاطلاع على المحتوى تواصل مع الفريق"). |
| **شريط الإنجاز (Progress)** وواجهة `CourseProgress` | `components/course-progress.tsx` | 1–27 | مكوّن يعرض `Progress` بناءً على `value` و `variant` | **مراجعة**: المكوّن **غير مستورد** في أي ملف آخر حاليًا. إن كان الهدف B2B فقط بدون تتبع إنجاز دروس، يمكن حذف الملف أو تركه ككود ميت حتى يُستخدم لاحقًا. |
| **عدد الدروس / الفصول** في النوع فقط | `components/courses-list.tsx` | 5–8 | النوع `CourseWithProgressWithCategory` يحتوي على `chapters: { id: string }[]` و `progress: number \| null` | **مراجعة**: لا يُعرض عدد الدروس أو شريط الإنجاز في الواجهة (الـ `CourseCard` لا يعرضهما). النوع يأتي من `getCourses`. إن أردت إزالة أي إيحاء بـ "تقدم الطالب"، يمكن تبسيط النوع وإزالة `progress` من الاستعلامات. |
| **CourseProgressButton** ("Mark as complete" / تحديث التقدم) | `app/.../chapters/[chapterId]/_components/course-progress-button.tsx` | 52–64 | استدعاء `PUT .../progress` و `toast.success("Progress updated")` | **Delete/Replace**: المكوّن **غير مستورد** في أي صفحة (صفحة الفصل تعيد التوجيه). يفضّل حذفه أو تعطيله لعدم وجود مسار "دروس فيديو" في B2B. |
| **VideoPlayer** (Mux، Lock، onEnd → progress) | `app/.../chapters/[chapterId]/_components/video-player.tsx` | 39–47, 61–74 | تشغيل فيديو + تحديث progress عند الانتهاء + عرض Lock للفصل المقفل | **Delete/Replace**: نفس السياق؛ الصفحة التي كانت تعرضه تعيد التوجيه. يمكن حذف الملف أو استبدال المحتوى لاحقًا بنموذج "طلب عرض تدريبي" بدل الفيديو. |
| **CourseEnrollButton** (WhatsApp "Request Enterprise Proposal") | `app/.../chapters/[chapterId]/_components/course-enroll-button.tsx` | 17–25 | يفتح واتساب مع نص جاهز | **مراجعة**: المكوّن غير مستورد. إن أردت توحيد المسار في "النموذج المؤسسي" فقط، يمكن حذف هذا المكوّن أو دمجه مع مسار "طلب تدريب مؤسسي" في صفحة الكورس. |

**ملخص الأيقونات/المكوّنات:**

- **قفل (Lock)**: موجود فقط داخل `video-player.tsx` (غير مستخدم حاليًا).
- **شريط الإنجاز**: مكوّن `CourseProgress` وواجهة `Progress` في `components/ui/progress.tsx` (الأخير عام وقد يُستخدم في أماكن أخرى). `CourseProgress` غير مستخدم.
- **عدد الدروس**: غير معروض في الواجهة؛ موجود فقط في نوع البيانات في `courses-list.tsx`.

---

## 3. فحص الترابط (Mapping)

### 3.1 هل زر "طلب تدريب مؤسسي" مرتبط بجدول CorporateInquiry؟

- **نعم.**
  - في `course-cta.tsx` (سطر 70–88) النموذج يرسل `POST /api/corporate-inquiry` بالحقول: `courseId`, `courseTitle`, `name`, `email`, `companyName`, `employeesCount`, `location`, `phone`, `message`.
  - في `app/api/corporate-inquiry/route.ts` (سطر 108–118) يتم استدعاء `db.corporateInquiry.create({ data: { ... } })` مع نفس الحقول. لا يوجد أي كتابة لجدول حجز فردي أو دفعات.
  - زر "طلب تدريب مؤسسي" في الـ Calendar (training-calendar) يضبط `#corporate-request` فقط، و`CourseCta` يفتح الـ Dialog عند وجود هذا الـ hash، والنموذج نفسه هو الذي يرسل إلى `/api/corporate-inquiry`. إذن المسار من الزر إلى جدول **CorporateInquiry** متكامل.

### 3.2 أزرار أو روابط تؤدي إلى 404 أو لوحة تحكم طالب قديمة؟

- **صفحة `/teacher/bookings`**: موجودة وتعيد التوجيه إلى `/teacher/corporate-inquiries` (redirect). لا تؤدي إلى 404.
- **صفحة Dashboard `/dashboard`**: حسب التنفيذ السابق، غير المسجّلين والطلاب يُوجّهون إلى `/`، والمدربون إلى `/teacher/courses`. لا رابط مباشر في الـ Navbar لـ `/dashboard` للمستخدم العادي؛ المدرب يصل عبر "Dashboard" في `navbar-routes` إلى `/teacher/courses`.
- **روابط أخرى**: لم يُعثر على `href` لـ `/dashboard` أو `/checkout` أو `/purchase` في مكوّنات الواجهة المفحوصة. مسار الحجز القديم تم إيقافه (APIs ترجع 410 أو بدون منطق).

**الخلاصة (Mapping):** زر "طلب تدريب مؤسسي" مرتبط فعليًا بجدول **CorporateInquiry**، ولا توجد أزرار واجهة تؤدي إلى 404 أو لوحة طالب قديمة في المسار الحالي.

---

## 4. الخلاصة — قائمة الملفات المقترحة للتعديل الفوري

لضمان أن المسار الوحيد المتاح هو: **مشاهدة الكورس → فتح النموذج المؤسسي → إرسال الطلب**، يُقترح التركيز على التالي (بدون تغيير سلوك المسار الحالي إنما إزالة أو توضيح ما يخص الفيديو/التقدم):

| # | الملف | نوع التعديل المقترح |
|---|--------|---------------------|
| 1 | `app/[locale]/(course)/courses/[courseId]/chapters/[chapterId]/_components/video-player.tsx` | **حذف أو استبدال**: أيقونة القفل ونص "This chapter is locked" وكل منطق الفيديو/التقدم — أو حذف الملف كاملاً إن لم يُخطط لاستخدامه في B2B. |
| 2 | `app/[locale]/(course)/courses/[courseId]/chapters/[chapterId]/_components/course-progress-button.tsx` | **حذف أو تعطيل**: مكوّن "Mark as complete" وتحديث التقدم — غير مستخدم ولا يخدم المسار B2B. |
| 3 | `app/[locale]/(course)/courses/[courseId]/chapters/[chapterId]/_components/course-enroll-button.tsx` | **مراجعة**: غير مستورد؛ إن أردت مسارًا واحدًا فقط (النموذج المؤسسي في صفحة الكورس)، يمكن حذفه أو دمجه لاحقًا. |
| 4 | `components/course-progress.tsx` | **مراجعة**: غير مستورد في أي مكان؛ إن لم تكن تحتاج شريط إنجاز طالب في الواجهة، يمكن حذفه أو تركه كود ميت. |
| 5 | `components/courses-list.tsx` | **اختياري**: تبسيط النوع `CourseWithProgressWithCategory` وإزالة `progress` من الاستعلام إن رغبت بعدم جلب "تقدم الطالب" نهائيًا. |

**ملفات لا تحتاج تعديلاً فورياً لتحقيق المسار المطلوب (هي بالفعل صحيحة):**

- `components/public-navbar.tsx`, `components/navbar-routes.tsx`
- `app/[locale]/page.tsx` (Hero)
- `app/[locale]/(course)/courses/[courseId]/_components/course-cta.tsx`
- `app/[locale]/(course)/courses/[courseId]/_components/training-calendar.tsx`
- `app/[locale]/(course)/courses/[courseId]/_components/course-details-tabs.tsx`
- `app/[locale]/(course)/courses/[courseId]/_components/course-sidebar-item.tsx`
- `app/api/corporate-inquiry/route.ts` (الربط مع CorporateInquiry صحيح)
- `components/upcoming-training-table.tsx`, `components/course-card.tsx`

---

**ملاحظة:** لم يُجرَ أي تعديل على الكود؛ هذا التقرير للمراجعة فقط حسب الطلب.
