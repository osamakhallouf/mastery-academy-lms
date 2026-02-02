import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Award, BookOpen, Clock, FileText, Star } from "lucide-react";
import { WhatsAppFloat } from "@/components/whatsapp-float";

import { CourseDetailsTabs } from "./_components/course-details-tabs";
import { CourseCta } from "./_components/course-cta";

const CourseIdPage = async ({
  params
}: {
  params: { courseId: string; }
}) => {
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      isPublished: true,
    },
    include: {
      category: true,
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc"
        }
      },
      attachments: {
        orderBy: {
          createAt: "desc",
        },
      },
      _count: {
        select: {
          leads: true,
        },
      },
    }
  });

  if (!course) {
    return redirect("/");
  }

  const inquiryCount = course._count?.leads ?? 0;
  const learningPoints = course.chapters.slice(0, 5).map((chapter) => chapter.title);
  const targetAudience = [
    "Corporate leaders and department heads developing enterprise capability.",
    "Quality, operations, and continuous improvement teams.",
    "Technology, innovation, and digital transformation leaders.",
  ];
  const schedule = [
    { date: "2026-02-15", city: "Dubai", status: "Available" },
    { date: "2026-03-10", city: "Riyadh", status: "Available" },
    { date: "2026-04-05", city: "Online", status: "Limited Seats" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
        <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-16 text-white">
          <div className="flex flex-col gap-6">
            <nav className="text-sm text-slate-300">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <Link href="/" className="hover:text-white">Programs</Link>
              <span className="mx-2">›</span>
              <span className="text-slate-100">{course.category?.name ?? "Category"}</span>
            </nav>

            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
                {course.title}
              </h1>
              {course.author && (
                <p className="text-sm text-slate-300">Instructor: {course.author}</p>
              )}
              {course.description && (
                <p className="text-slate-200 max-w-2xl line-clamp-2">
                  {course.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-300">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                <Star className="h-5 w-5 text-amber-400" />
                <Star className="h-5 w-5 text-amber-400" />
                <Star className="h-5 w-5 text-amber-400" />
                <Star className="h-5 w-5 text-amber-400" />
                <span className="text-sm">(4.9)</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{course.chapters.length} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Self‑paced</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>{course.attachments.length} resources</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                <span>{inquiryCount} enterprise inquiries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
            {/* Left Content */}
            <div className="space-y-8">
              <CourseDetailsTabs
                description={course.description}
                learningPoints={learningPoints}
                targetAudience={targetAudience}
                chapters={course.chapters.map((chapter) => ({
                  id: chapter.id,
                  title: chapter.title,
                  description: chapter.description ?? null,
                }))}
              />

              <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-md p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Training Calendar
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Upcoming cohorts across key cities and virtual classrooms.
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/971557028756?text=${encodeURIComponent(
                      `Request In-House Training\nCourse: ${course.title}`
                    )}`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Request In‑House Training
                  </a>
                </div>

                <div className="hidden md:block">
                  <div className="w-full overflow-hidden rounded-xl border border-slate-200">
                    <div className="grid grid-cols-3 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <div className="px-4 py-3">Date</div>
                      <div className="px-4 py-3">City</div>
                      <div className="px-4 py-3">Status</div>
                    </div>
                    {schedule.map((item) => (
                      <div
                        key={`${item.date}-${item.city}`}
                        className="grid grid-cols-3 border-t border-slate-200 text-sm text-slate-700"
                      >
                        <div className="px-4 py-3">{item.date}</div>
                        <div className="px-4 py-3">{item.city}</div>
                        <div className="px-4 py-3">
                          <span
                            className={
                              item.status === "Available"
                                ? "rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700"
                                : "rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                            }
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:hidden space-y-3">
                  {schedule.map((item) => (
                    <div
                      key={`${item.date}-${item.city}-mobile`}
                      className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.date}</span>
                        <span
                          className={
                            item.status === "Available"
                              ? "rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700"
                              : "rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                          }
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-2 text-slate-600">{item.city}</div>
                    </div>
                  ))}
                </div>
              </div>
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
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span>{course.chapters.length} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span>{course.attachments.length} PDF resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-500" />
                      <span>Lifetime access</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      What you will learn
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      {learningPoints.slice(0, 4).map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                          <span>{point}</span>
                        </li>
                      ))}
                      {learningPoints.length === 0 && (
                        <li className="text-slate-500">Great content coming soon.</li>
                      )}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                    Corporate delivery is available through customized enterprise proposals.
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