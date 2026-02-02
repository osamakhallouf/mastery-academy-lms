import { format } from "date-fns";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { ConfirmationForm } from "./_components/confirmation-form";

const ConfirmationPage = async ({
  params,
}: {
  params: { inquiryId: string };
}) => {
  const inquiry = await db.corporateInquiry.findUnique({
    where: { id: params.inquiryId },
    include: {
      course: true,
      confirmationLetter: true,
    },
  });

  if (!inquiry) {
    return redirect("/teacher/corporate-inquiries");
  }

  const confirmation = inquiry.confirmationLetter;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Confirmation Letter
        </h1>
        <p className="text-sm text-slate-500">
          {inquiry.companyName} ·{" "}
          {format(inquiry.createdAt, "dd MMM yyyy")}
        </p>
        <p className="text-sm text-slate-600 mt-2">
          Course: {inquiry.course?.title ?? "Corporate Training"}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ConfirmationForm
          inquiryId={inquiry.id}
          defaultParticipants={confirmation?.participants ?? []}
          defaultLocation={confirmation?.location ?? inquiry.location}
          defaultTime={confirmation?.time ?? ""}
          defaultCourseDate={
            confirmation?.courseDate
              ? format(confirmation.courseDate, "yyyy-MM-dd")
              : ""
          }
          defaultTotalFees={confirmation?.totalFees ?? ""}
        />
      </div>
    </div>
  );
};

export default ConfirmationPage;
