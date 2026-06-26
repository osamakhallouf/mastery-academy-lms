"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { CourseRun } from "@prisma/client";

const CORPORATE_HASH = "#corporate-request";

interface TrainingCalendarProps {
  courseId: string;
  courseTitle: string;
  runs: CourseRun[];
}

export const TrainingCalendar = ({
  courseId,
  courseTitle,
  runs,
}: TrainingCalendarProps) => {
  const t = useTranslations("course");

  const openCorporateForm = () => {
    if (typeof window !== "undefined") {
      window.location.hash = CORPORATE_HASH;
    }
  };

  if (runs.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-[#1e293b]/20 bg-white shadow-lg p-8 md:p-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e293b] text-[#d4af37]">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1e293b]">
              {t("calendarTitle")}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {t("noScheduledRuns")}
            </p>
          </div>
        </div>
        <p className="text-slate-600">
          {t("useCorporateRequest")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[#1e293b]/20 bg-white shadow-xl overflow-hidden">
      <div className="bg-[#1e293b] px-6 py-6 md:px-8 md:py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37] text-[#1e293b]">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {t("calendarTitle")}
            </h2>
            <p className="text-sm text-slate-300 mt-0.5">
              {t("calendarSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="hidden md:block overflow-hidden rounded-xl border-2 border-[#1e293b]/15">
          <div className="grid grid-cols-10 gap-2 bg-[#1e293b] text-xs font-semibold uppercase tracking-wide text-[#d4af37]">
            <div className="col-span-3 px-4 py-4">{t("date")}</div>
            <div className="col-span-3 px-4 py-4">{t("cityLocation")}</div>
            <div className="col-span-4 px-4 py-4">{t("action")}</div>
          </div>
          {runs.map((run, idx) => {
            const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
            return (
              <div
                key={run.id}
                className={`grid grid-cols-10 gap-2 border-t border-slate-200 text-sm text-slate-800 items-center ${rowBg}`}
              >
                <div className="col-span-3 px-4 py-4 font-medium">
                  {format(new Date(run.startDate), "dd MMM yyyy")}
                  {run.endDate
                    ? ` – ${format(new Date(run.endDate), "dd MMM yyyy")}`
                    : ""}
                </div>
                <div className="col-span-3 px-4 py-4">
                  {run.location || "—"}
                </div>
                <div className="col-span-4 px-4 py-4">
                  <Button
                    size="sm"
                    className="bg-[#d4af37] hover:bg-[#c89f2f] text-[#1e293b] font-semibold"
                    onClick={openCorporateForm}
                  >
                    {t("corporateTrainingRequest")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="md:hidden space-y-4">
          {runs.map((run) => (
            <div
              key={run.id}
              className="rounded-xl border-2 border-[#1e293b]/15 bg-slate-50/50 p-4"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-semibold text-[#1e293b]">
                  {format(new Date(run.startDate), "dd MMM yyyy")}
                  {run.endDate
                    ? ` – ${format(new Date(run.endDate), "dd MMM yyyy")}`
                    : ""}
                </span>
                <Button
                  size="sm"
                  className="bg-[#d4af37] hover:bg-[#c89f2f] text-[#1e293b] font-semibold"
                  onClick={openCorporateForm}
                >
                  {t("corporateTrainingRequest")}
                </Button>
              </div>
              {run.location && (
                <div className="mt-3 text-sm text-slate-600">
                  <span className="font-medium">{run.location}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
