"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { LayoutGrid, List } from "lucide-react";

import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import type { GetCoursesResult } from "@/actions/get-courses";

type CourseItem = GetCoursesResult["courses"][number];

interface CoursesListWithTableProps {
  items: CourseItem[];
}

export function CoursesListWithTable({ items }: CoursesListWithTableProps) {
  const [view, setView] = useState<"cards" | "table">("cards");

  const flatRuns: { run: NonNullable<CourseItem["courseRuns"]>[number]; course: CourseItem }[] = [];
  items.forEach((course) => {
    const runs = course.courseRuns ?? [];
    runs.forEach((run) => {
      flatRuns.push({ run, course });
    });
  });
  flatRuns.sort((a, b) => new Date(a.run.startDate).getTime() - new Date(b.run.startDate).getTime());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-slate-500">
          {view === "cards" ? `${items.length} program(s)` : `${flatRuns.length} upcoming run(s)`}
        </span>
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setView("cards")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              view === "cards"
                ? "bg-[#1e293b] text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="mr-1.5 inline h-4 w-4 align-middle" />
            Cards
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              view === "table"
                ? "bg-[#1e293b] text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="mr-1.5 inline h-4 w-4 align-middle" />
            Table View
          </button>
        </div>
      </div>

      {view === "cards" && (
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <CourseCard
              key={item.id}
              id={item.id}
              title={item.title}
              imageUrl={item.imageUrl ?? ""}
              category={item?.category?.name ?? ""}
            />
          ))}
        </div>
      )}

      {view === "table" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-[#1e293b] text-left text-xs font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {flatRuns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No upcoming runs. Try another filter or check back later.
                    </td>
                  </tr>
                ) : (
                  flatRuns.map(({ run, course }) => (
                    <tr
                      key={run.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {format(new Date(run.startDate), "dd MMM yyyy")}
                        {run.endDate
                          ? ` – ${format(new Date(run.endDate), "dd MMM yyyy")}`
                          : ""}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {run.location || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {course.title}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/courses/${course.id}`}>
                          <Button
                            size="sm"
                            className="bg-[#1e293b] hover:bg-[#0f172a] text-white"
                          >
                            Register
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
      )}

      {view === "cards" && items.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-10">
          No courses found
        </div>
      )}
    </div>
  );
}
