import Link from "next/link";
import { format } from "date-fns";
import { CalendarCheck } from "lucide-react";

import type { StudentBookingItem } from "@/actions/get-student-bookings";

interface MyBookingsSectionProps {
  bookings: StudentBookingItem[];
}

export const MyBookingsSection = ({ bookings }: MyBookingsSectionProps) => {
  if (bookings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <CalendarCheck className="h-5 w-5" />
        My Bookings
      </h2>
      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div>
              <Link
                href={`/courses/${b.course.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {b.course.title}
              </Link>
              <p className="text-sm text-slate-500 mt-0.5">
                {format(new Date(b.courseRun.startDate), "dd MMM yyyy")}
                {b.courseRun.endDate
                  ? ` – ${format(new Date(b.courseRun.endDate), "dd MMM yyyy")}`
                  : ""}
                {b.courseRun.location && ` · ${b.courseRun.location}`}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium shrink-0 ${
                b.status === "approved"
                  ? "bg-emerald-100 text-emerald-700"
                  : b.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
