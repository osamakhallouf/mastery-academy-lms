import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { generateConfirmationPdf } from "@/lib/confirmation-letter";
import { sendResendEmail } from "@/lib/resend";

const parseParticipants = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export async function POST(
  req: Request,
  { params }: { params: { inquiryId: string } }
) {
  try {
    const body = await req.json();
    const participants = parseParticipants(body?.participants);
    const location = String(body?.location ?? "").trim();
    const time = String(body?.time ?? "").trim();
    const courseDate = String(body?.courseDate ?? "").trim();
    const totalFees = String(body?.totalFees ?? "").trim();

    if (!location || !time || !courseDate || !totalFees) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const inquiry = await db.corporateInquiry.findUnique({
      where: { id: params.inquiryId },
      include: { course: true },
    });

    if (!inquiry) {
      return new NextResponse("Not found", { status: 404 });
    }

    const confirmation = await db.confirmationLetter.upsert({
      where: { inquiryId: inquiry.id },
      create: {
        inquiryId: inquiry.id,
        participants,
        location,
        time,
        courseDate: new Date(courseDate),
        totalFees,
      },
      update: {
        participants,
        location,
        time,
        courseDate: new Date(courseDate),
        totalFees,
      },
    });

    const pdfBuffer = generateConfirmationPdf({
      companyName: inquiry.companyName,
      courseTitle: inquiry.course?.title ?? inquiry.courseId ?? "Corporate Training",
      courseDate: new Date(courseDate),
      location,
      time,
      totalFees,
      participants,
    });

    await sendResendEmail({
      to: inquiry.email,
      subject: `Confirmation Letter - ${inquiry.companyName}`,
      html: `
        <p>Dear ${inquiry.companyName},</p>
        <p>Please find the confirmation letter attached.</p>
        <p>Best regards,<br />Mastery Academy</p>
      `,
      attachments: [
        {
          filename: "confirmation-letter.pdf",
          content: Buffer.from(pdfBuffer).toString("base64"),
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      confirmationId: confirmation.id,
    });
  } catch (error) {
    console.error("[CONFIRMATION_LETTER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { inquiryId: string } }
) {
  try {
    const inquiry = await db.corporateInquiry.findUnique({
      where: { id: params.inquiryId },
      include: {
        course: true,
        confirmationLetter: true,
      },
    });

    if (!inquiry || !inquiry.confirmationLetter) {
      return new NextResponse("Not found", { status: 404 });
    }

    const confirmation = inquiry.confirmationLetter;
    const pdfBuffer = generateConfirmationPdf({
      companyName: inquiry.companyName,
      courseTitle: inquiry.course?.title ?? inquiry.courseId ?? "Corporate Training",
      courseDate: confirmation.courseDate,
      location: confirmation.location,
      time: confirmation.time,
      totalFees: confirmation.totalFees,
      participants: confirmation.participants,
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="confirmation-letter-${inquiry.companyName}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[CONFIRMATION_LETTER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
