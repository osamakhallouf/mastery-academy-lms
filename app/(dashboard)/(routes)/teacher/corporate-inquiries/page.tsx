import Link from "next/link";
import { format } from "date-fns";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

const CorporateInquiriesPage = async () => {
  const inquiries = await db.corporateInquiry.findMany({
    include: {
      course: true,
      confirmationLetter: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Corporate Inquiries
        </h1>
        <p className="text-sm text-slate-500">
          Review requests and issue confirmation letters.
        </p>
      </div>

      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-slate-900">
                  {inquiry.companyName}
                </h2>
                <p className="text-sm text-slate-500">
                  {inquiry.course?.title ?? "Corporate Training"} ·{" "}
                  {format(inquiry.createdAt, "dd MMM yyyy")}
                </p>
                <p className="text-sm text-slate-600">
                  Contact: {inquiry.name} · {inquiry.email} ·{" "}
                  <span dir="ltr">{inquiry.phone}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    inquiry.confirmationLetter
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {inquiry.confirmationLetter ? "Confirmed" : "Pending"}
                </span>
                <Link
                  href={`/teacher/corporate-inquiries/${inquiry.id}/confirmation`}
                >
                  <Button variant="outline">
                    {inquiry.confirmationLetter
                      ? "View Confirmation"
                      : "Create Confirmation"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
        {inquiries.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No corporate inquiries yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default CorporateInquiriesPage;
