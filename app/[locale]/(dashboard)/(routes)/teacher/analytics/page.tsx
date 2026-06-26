import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

import { getAnalytics } from "@/actions/get-analytics";
import { DataCard } from "./_components/data-card";

export default async function AnalyticsPage() {
  const locale = await getLocale();
  const { userId } = auth();
  if (!userId) {
    return redirect({ href: "/", locale });
  }

  const {
    totalInquiries,
    pendingInquiries,
    confirmedInquiries,
    inquiriesByCourse,
  } = await getAnalytics(userId);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DataCard
          label="Total Corporate Inquiries"
          value={totalInquiries}
          shouldFormat={false}
        />
        <DataCard
          label="Pending"
          value={pendingInquiries}
          shouldFormat={false}
        />
        <DataCard
          label="Confirmed"
          value={confirmedInquiries}
          shouldFormat={false}
        />
      </div>

      {inquiriesByCourse.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Inquiries by course</h3>
          <ul className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
            {inquiriesByCourse.slice(0, 10).map((item, i) => (
              <li
                key={i}
                className="flex justify-between items-center px-4 py-3 text-sm"
              >
                <span className="text-slate-700 truncate mr-2">
                  {item.courseTitle}
                </span>
                <span className="font-medium text-slate-900">
                  {item.count} inquiries
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
