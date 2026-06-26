# ترجمة محتوى قاعدة البيانات (Prisma) – عناوين ووصف الكورسات

## الخيارات الموصى بها

### 1. حقول مكررة لكل لغة (موصى به للبداية)

أضف حقولاً منفصلة للعربية والإنجليزية في نفس الجدول:

```prisma
model Course {
  id          String   @id @default(uuid())
  userId      String
  // اللغة الافتراضية (مثلاً الإنجليزية)
  title       String   @db.Text
  description String?  @db.Text
  // ترجمات اختيارية
  titleAr     String?  @db.Text  // عنوان بالعربية
  descriptionAr String? @db.Text  // وصف بالعربية

  author      String?
  imageUrl    String?
  price       Float?
  isPublished Boolean  @default(false)
  categoryId  String?
  // ... باقي العلاقات
}

model Chapter {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  titleAr     String?  @db.Text
  descriptionAr String? @db.Text
  // ...
}
```

**في الكود:** عند عرض المحتوى استخدم `locale` الحالي لاختيار الحقل:

```ts
const title = locale === "ar" && course.titleAr ? course.titleAr : course.title;
const description = locale === "ar" && course.descriptionAr ? course.descriptionAr : course.description;
```

**مميزات:** بسيط، استعلامات سريعة، لا يحتاج جداول إضافية.  
**عيوب:** إضافة لغة جديدة يحتاج تعديل الـ schema وهجرة.

---

### 2. جدول ترجمات منفصل (قابل للتوسع)

جدول واحد للترجمات حسب الكيان واللغة:

```prisma
model Course {
  id          String   @id @default(uuid())
  userId      String
  title       String   @db.Text   // fallback
  description String?  @db.Text
  // ترجمات في جدول منفصل
  translations CourseTranslation[]
  // ...
}

model CourseTranslation {
  id         String   @id @default(uuid())
  courseId   String
  locale     String   // "en" | "ar"
  title      String   @db.Text
  description String? @db.Text

  course     Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([courseId, locale])
  @@index([courseId])
}
```

**في الكود:** جلب الترجمة حسب `locale`:

```ts
const t = course.translations.find((tr) => tr.locale === locale);
const title = t?.title ?? course.title;
const description = t?.description ?? course.description;
```

**مميزات:** إضافة لغات جديدة بدون تغيير الـ schema.  
**عيوب:** استعلامات أوضح مع `include`/`join`.

---

### 3. حقول JSON للترجمات

حقل واحد يخزن كل اللغات:

```prisma
model Course {
  id          String   @id @default(uuid())
  userId      String
  title       String   @db.Text   // fallback
  description String?  @db.Text
  titleTranslations    Json?  // { "en": "...", "ar": "..." }
  descriptionTranslations Json?  // { "en": "...", "ar": "..." }
  // ...
}
```

**في الكود:**

```ts
const title = (course.titleTranslations as Record<string, string>)?.[locale] ?? course.title;
```

**مميزات:** مرونة، لغة جديدة = مفتاح جديد.  
**عيوب:** صعوبة البحث/الفهرسة في DB حسب النص المترجم.

---

## التوصية لهذا المشروع

- للبداية: **الخيار 1** (`titleEn`/`titleAr` أو الإبقاء على `title` كإنجليزي وإضافة `titleAr`, `descriptionAr`) لسهولة التنفيذ والأداء.
- إذا تخطيطك لإضافة لغات أخرى لاحقاً: **الخيار 2** (جدول ترجمات).

بعد تعديل الـ schema لا تنسَ:

```bash
npx prisma migrate dev --name add_course_translations
npx prisma generate
```

ثم في صفحات العرض (مثلاً `app/[locale]/(course)/courses/[courseId]/page.tsx`) استخدم `locale` من الـ params أو من `getLocale()` واختر الحقل المناسب للعنوان والوصف.
