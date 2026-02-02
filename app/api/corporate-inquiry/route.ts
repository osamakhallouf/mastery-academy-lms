import { NextResponse } from "next/server";

import { db } from "@/lib/db";
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

const buildEmailHtml = (payload: Required<InquiryPayload>) => `
  <h2>New Corporate Training Inquiry</h2>
  <p><strong>Course</strong>: ${payload.courseTitle}</p>
  <p><strong>Company</strong>: ${payload.companyName}</p>
  <p><strong>Employees</strong>: ${payload.employeesCount}</p>
  <p><strong>Location</strong>: ${payload.location}</p>
  <p><strong>Contact Name</strong>: ${payload.name}</p>
  <p><strong>Email</strong>: ${payload.email}</p>
  <p><strong>Phone</strong>: ${payload.phone}</p>
  ${payload.message ? `<p><strong>Message</strong>: ${payload.message}</p>` : ""}
`;

const sendAdminNotification = async (payload: Required<InquiryPayload>) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error("[CORPORATE_INQUIRY] Missing ADMIN_EMAIL.");
    return;
  }

  await sendResendEmail({
    to: adminEmail,
    subject: `New Corporate Inquiry: ${payload.courseTitle}`,
    html: buildEmailHtml(payload),
  });
};

export async function POST(req: Request) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    const rate = rateLimit(`corporate-inquiry:${ip}`, {
      limit: 5,
      windowMs: 60_000,
    });

    if (!rate.success) {
      return new NextResponse("Too many requests", { status: 429 });
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
      !payload.location ||
      !payload.name ||
      !payload.email ||
      !payload.phone
    ) {
      return new NextResponse("Invalid payload", { status: 400 });
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}
