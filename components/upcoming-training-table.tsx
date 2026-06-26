"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import type { GetCoursesResult } from "@/actions/get-courses";

type CourseItem = GetCoursesResult["courses"][number];

interface UpcomingTrainingTableProps {
  items: CourseItem[];
}

function getDuration(start: Date, end: Date | null): string {
  if (!end) return "—";
  const startD = new Date(start);
  const endD = new Date(end);
  const days = differenceInDays(endD, startD) + 1;
  return days === 1 ? "1 day" : `${days} days`;
}

export function UpcomingTrainingTable({ items }: UpcomingTrainingTableProps) {
  const t = useTranslations("table");
  const tHome = useTranslations("home");
  const flatRuns: { run: NonNullable<CourseItem["courseRuns"]>[number]; course: CourseItem }[] = [];
  items.forEach((course) => {
    (course.courseRuns ?? []).forEach((run) => {
      flatRuns.push({ run, course });
    });
  });
  flatRuns.sort((a, b) => new Date(a.run.startDate).getTime() - new Date(b.run.startDate).getTime());

  return (
    <div className="overflow-hidden rounded-xl border-2 border-[#1e293b]/15 bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-[#1e293b] text-left text-xs font-semibold uppercase tracking-wide text-[#d4af37]">
              <th className="px-4 py-4">{t("courseName")}</th>
              <th className="px-4 py-4 whitespace-nowrap">{t("date")}</th>
              <th className="px-4 py-4">{t("location")}</th>
              <th className="px-4 py-4">{t("duration")}</th>
              <th className="px-4 py-4 text-right">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {flatRuns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  {tHome("noUpcomingRuns")}
                </td>
              </tr>
            ) : (
              flatRuns.map(({ run, course }, idx) => (
                <tr
                  key={run.id}
                  className={`border-t border-slate-100 transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  } hover:bg-[#1e293b]/5`}
                >
                  <td className="px-4 py-4">
                    <span className="font-semibold text-[#1e293b]">{course.title}</span>
                    {course.category?.name && (
                      <span className="block text-xs text-slate-500 mt-0.5">{course.category.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                    {format(new Date(run.startDate), "dd MMM yyyy")}
                    {run.endDate
                      ? ` – ${format(new Date(run.endDate), "dd MMM yyyy")}`
                      : ""}
                  </td>
                  <td className="px-4 py-4 text-slate-700">{run.location || "—"}</td>
                  <td className="px-4 py-4 text-slate-700">
                    {getDuration(run.startDate, run.endDate)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/courses/${course.id}`}>
                      <Button
                        size="sm"
                        className="bg-[#d4af37] hover:bg-[#c89f2f] text-[#1e293b] font-semibold"
                      >
                        {t("viewDetails")}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
