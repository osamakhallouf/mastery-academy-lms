import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { sendResendEmail } from "@/lib/resend";

type InquiryPayload = {
  courseId?: string;
  courseTitle?: string;
  companyName?: string;
  employeesCount?: string;
  location?: string;
  message?: string;
  name?: string;
  email?: string;
  phone?: string;
};

const sanitize = (value: string) => value.trim();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const buildEmailHtml = (payload: Required<InquiryPayload>) => {
  const e = escapeHtml;
  const appUrl = (env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const dashboardUrl = appUrl
    ? `${appUrl}/en/teacher/corporate-inquiries`
    : "";

  return `
  <h2>New Training Request</h2>
  <p>
    <strong>Client Name:</strong> ${e(payload.name)}<br/>
    <strong>Company:</strong> ${e(payload.companyName)}<br/>
    <strong>Phone:</strong> ${e(payload.phone)}<br/>
    <strong>Email:</strong> ${e(payload.email)}<br/>
    <strong>Location:</strong> ${e(payload.location)}<br/>
    <strong>Employees:</strong> ${e(payload.employeesCount)}<br/>
    <strong>Message:</strong> ${
      payload.message ? e(payload.message) : "—"
    }<br/>
    <strong>Course:</strong> ${e(payload.courseTitle || "Corporate Training")}
  </p>
  ${
    dashboardUrl
      ? `<p><a href="${dashboardUrl}" style="display:inline-block;margin-top:12px;padding:8px 14px;border-radius:999px;background:#0f172a;color:#ffffff;text-decoration:none;font-size:13px;">Open Corporate Inquiries</a></p>`
      : ""
  }
`;
};

const sendAdminNotification = async (payload: Required<InquiryPayload>) => {
  const adminEmail =
    process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || "osamakhallouf22@gmail.com";

  if (!adminEmail) {
    console.error("[CORPORATE_INQUIRY] Missing ADMIN_EMAIL.");
    return;
  }

  await sendResendEmail({
    to: adminEmail,
    subject: `🚀 New Training Request from ${payload.companyName}`,
    html: buildEmailHtml(payload),
  });
};

export async function POST(req: Request) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    const rate = await rateLimit(`corporate-inquiry:${ip}`, {
      limit: 5,
      windowMs: 60_000,
    });

    if (!rate.success) {
      return apiError("Too many requests", 429);
    }

    const body = (await req.json()) as InquiryPayload;
    const payload: Required<InquiryPayload> = {
      courseId: sanitize(body.courseId ?? ""),
      courseTitle: sanitize(body.courseTitle ?? ""),
      companyName: sanitize(body.companyName ?? ""),
      employeesCount: sanitize(body.employeesCount ?? ""),
      location: sanitize(body.location ?? ""),
      message: sanitize(body.message ?? ""),
      name: sanitize(body.name ?? ""),
      email: sanitize(body.email ?? ""),
      phone: sanitize(body.phone ?? ""),
    };

    if (
      !payload.companyName ||
      !payload.employeesCount ||
      !/^\d+$/.test(payload.employeesCount) ||
      !payload.location ||
      !payload.name ||
      !payload.email ||
      !payload.phone
    ) {
      return apiError("Invalid payload", 400);
    }

    let resolvedCourseId: string | null = payload.courseId || null;
    if (resolvedCourseId) {
      const course = await db.course.findUnique({
        where: { id: resolvedCourseId },
        select: { id: true },
      });
      if (!course) {
        resolvedCourseId = null;
      }
    }

    const inquiry = await db.corporateInquiry.create({
      data: {
        name: payload.name,
        email: payload.email,
        companyName: payload.companyName,
        phone: payload.phone,
        employeesCount: payload.employeesCount,
        location: payload.location,
        message: payload.message || null,
        courseId: resolvedCourseId,
      },
    });

    await sendAdminNotification(payload);

    return NextResponse.json({
      success: true,
      message:
        "Thank you! Our corporate consultant will contact you at +971557028756 soon.",
    });
  } catch (error) {
    console.error("[CORPORATE_INQUIRY]", error);
    return apiError("Internal Error", 500);
  }
}
