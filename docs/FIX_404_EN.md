# إصلاح 404 لـ /en بعد حذف المكوّنات

## السبب
بعد حذف الملفات (`video-player`, `course-progress-button`, إلخ)، كاش Next (مجلد `.next`) بقي يشير لها. عند طلب `/en` يفشل البناء فيُرجع 404.

## الحل

1. **أوقف خادم التطوير**
   - في الطرفية التي تشغّل `npm run dev` اضغط **Ctrl+C**.

2. **احذف مجلد `.next`**
   - من PowerShell في مجلد المشروع:
     ```powershell
     Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
     ```
   - أو من CMD:
     ```cmd
     rd /s /q .next
     ```
   - إذا ظهر "Access denied": أغلق Cursor/VS Code وجميع الطرفيات، ثم احذف المجلد `.next` من مستكشف الملفات، أو شغّل الأمر من Command Prompt كمسؤول.

3. **شغّل التطوير من جديد**
   ```bash
   npm run dev
   ```

4. **افتح الموقع**
   - جرّب `http://localhost:3000` (سيوجّهك إلى `/en` أو `/ar`).
   - أو مباشرة `http://localhost:3000/en`.

بعد مسح `.next` يُفترض أن يختفي خطأ 404 لـ `/en`.

---

## ملاحظة: خطأ EPERM على `.next\trace`

إذا ظهر في الطرفية:
`[Error: EPERM: operation not permitted, open '.next\trace']`
فالمعنى أن Next.js لا يستطيع كتابة ملف التتبع. التطبيق عادة يستمر في العمل (GET /en 200). إن أردت التخلص من الرسالة: استثنِ مجلد المشروع أو `.next` من الفحص الفوري لمضاد الفيروسات، أو أوقف أي عملية أخرى تستخدم المشروع ثم أعد تشغيل `npm run dev`.
