import { auth } from "@clerk/nextjs/server";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { redirect } from "@/i18n/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Award, BookOpen, MapPin } from "lucide-react";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { stripLeadingAiPhrases, stripHtml } from "@/lib/description-clean";

import { CourseDetailsTabs } from "./_components/course-details-tabs";
import { CourseCta } from "./_components/course-cta";
import { TrainingCalendar } from "./_components/training-calendar";

const CourseIdPage = async ({
  params
}: {
  params: { courseId: string; }
}) => {
  const locale = await getLocale();
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      isPublished: true,
    },
    include: {
      category: true,
      attachments: {
        orderBy: {
          createAt: "desc",
        },
      },
      courseRuns: {
        orderBy: {
          startDate: "asc",
        },
      },
    }
  });

  const { userId } = auth();

  if (!course) {
    return redirect({ href: "/", locale });
  }

  const t = await getTranslations("course");
  const tCommon = await getTranslations("common");

  const cleanedDescription =
    course.description && typeof course.description === "string"
      ? stripLeadingAiPhrases(course.description.trim())
      : null;

  const targetAudience = [
    "Corporate leaders and department heads developing enterprise capability.",
    "Quality, operations, and continuous improvement teams.",
    "Technology, innovation, and digital transformation leaders.",
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
        <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-16 text-white">
          <div className="flex flex-col gap-6">
            <nav className="text-sm text-slate-300">
              <Link href="/" className="hover:text-white">{tCommon("home")}</Link>
              <span className="mx-2">›</span>
              <Link href="/" className="hover:text-white">{t("breadcrumbPrograms")}</Link>
              <span className="mx-2">›</span>
              <span className="text-slate-100">{course.category?.name ?? tCommon("category")}</span>
            </nav>

            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
                {course.title}
              </h1>
              {cleanedDescription && (
                <p className="text-slate-200 max-w-2xl line-clamp-2">
                  {stripHtml(cleanedDescription)}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{t("inPersonTraining")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                <span>{t("professionalCertification")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
            {/* Left Content: Training Calendar first (main focus), then tabs */}
            <div className="space-y-8">
              <TrainingCalendar
                courseId={course.id}
                courseTitle={course.title}
                runs={course.courseRuns}
              />

              <CourseDetailsTabs
                description={cleanedDescription}
                learningPoints={[]}
                targetAudience={targetAudience}
                chapters={[]}
              />
            </div>

            {/* Sidebar Card */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
                <div className="relative aspect-video">
                  {course.imageUrl ? (
                    <Image
                      fill
                      className="object-cover"
                      alt={course.title}
                      src={course.imageUrl}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <BookOpen className="h-14 w-14 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <CourseCta courseId={course.id} courseTitle={course.title} />

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>{t("inPersonTraining")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>{t("professionalCertification")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppFloat
        message={`I'm interested in corporate training for ${course.title}`}
      />
    </div>
  );
}

export default CourseIdPage;