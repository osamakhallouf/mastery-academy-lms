import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";

const ALLOWED_STATUSES = [
  "New",
  "Contacted",
  "Proposal Sent",
  "Closed / Won",
] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  req: Request,
  { params }: { params: { inquiryId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return apiError("Unauthorized", 401);
    }
    if (!isTeacher(userId)) {
      return apiError("Forbidden", 403);
    }

    const body = await req.json().catch(() => ({}));
    const status = typeof body?.status === "string" ? body.status.trim() : "";

    if (!status || !ALLOWED_STATUSES.includes(status as AllowedStatus)) {
      return apiError("Invalid status value", 400);
    }

    const inquiry = await db.corporateInquiry.update({
      where: { id: params.inquiryId },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json({ success: true, status: inquiry.status });
  } catch (error) {
    console.error("[CORPORATE_INQUIRY_STATUS_PATCH]", error);
    return apiError("Internal Error", 500);
  }
}

