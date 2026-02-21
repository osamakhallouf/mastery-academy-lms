import crypto from "crypto";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

const sanitizeText = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();

const wrapLine = (text: string, max = 90) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!word) continue;
    const next = current ? `${current} ${word}` : word;
    if (next.length > max) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [text];
};

const escapePdfText = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const BROCHURE_TTL_MS = 10 * 60 * 1000;

/** Optional env: brochure signed URLs require BROCHURE_SIGNING_SECRET. */
const getSigningSecret = () => env.BROCHURE_SIGNING_SECRET ?? undefined;

const signDownload = (courseId: string, expires: number, secret: string) =>
  crypto
    .createHmac("sha256", secret)
    .update(`${courseId}:${expires}`)
    .digest("hex");

const validateSignature = (
  courseId: string,
  expires: number,
  signature: string,
  secret: string
) => {
  const expected = signDownload(courseId, expires, secret);
  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(signature, "utf8")
  );
};

const buildPdf = (lines: string[]) => {
  const safeLines = lines.map((line) => escapePdfText(sanitizeText(line)));
  const textLines = safeLines.map((line) => `(${line}) Tj\nT*`).join("\n");
  const streamContent = `BT\n/F1 12 Tf\n72 720 Td\n${textLines}\nET`;
  const streamLength = Buffer.byteLength(streamContent, "utf8");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  const header = "%PDF-1.4\n";
  const offsets = [0];
  let offset = Buffer.byteLength(header, "utf8");

  for (const obj of objects) {
    offsets.push(offset);
    offset += Buffer.byteLength(obj, "utf8");
  }

  const xrefOffset = offset;
  const xrefLines = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((pos) => `${String(pos).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    `${xrefOffset}`,
    "%%EOF",
  ];

  const body = objects.join("");
  const xref = xrefLines.join("\n");
  return Buffer.from(`${header}${body}${xref}`, "utf8");
};

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    const rate = await rateLimit(`brochure:get:${ip}`, {
      limit: 10,
      windowMs: 60_000,
    });

    if (!rate.success) {
      return apiError("Too many requests", 429);
    }

    const secret = getSigningSecret();
    if (!secret) {
      return apiError("Missing signing secret", 500);
    }

    const { searchParams } = new URL(req.url);
    const expiresParam = searchParams.get("expires");
    const signature = searchParams.get("signature");
    const expires = expiresParam ? Number(expiresParam) : 0;

    if (!expires || !signature) {
      return apiError("Unauthorized", 401);
    }

    if (Number.isNaN(expires) || Date.now() > expires) {
      return apiError("Link expired", 401);
    }

    if (!validateSignature(params.courseId, expires, signature, secret)) {
      return apiError("Unauthorized", 401);
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: {
          select: {
            name: true,
          },
        },
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            title: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!course) {
      return apiError("Not found", 404);
    }

    const learningPoints = course.chapters
      .slice(0, 6)
      .map((chapter) => chapter.title);

    const lines = [
      "Mastery Academy - Course Brochure",
      `Course: ${course.title}`,
      `Category: ${course.category?.name ?? "General"}`,
      "",
      "About the Course:",
      ...(course.description
        ? wrapLine(course.description)
        : ["Course description will be updated soon."]),
      "",
      "Target Audience:",
      "- Corporate leaders and managers",
      "- Quality and operations professionals",
      "- Technology and transformation teams",
      "",
      "Course Objectives:",
      ...(learningPoints.length
        ? learningPoints.map((point) => `- ${point}`)
        : ["- Objectives will be shared upon request"]),
      "",
      "Course Outline:",
      ...(course.chapters.length
        ? course.chapters.map((chapter, index) => `${index + 1}. ${chapter.title}`)
        : ["Outline will be published soon"]),
    ];

    const pdf = buildPdf(lines);
    const filename = `course-brochure-${sanitizeText(course.title) || "course"}.pdf`;

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[COURSE_BROCHURE]", error);
    return apiError("Internal Error", 500);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    const rate = await rateLimit(`brochure:post:${ip}`, {
      limit: 8,
      windowMs: 60_000,
    });

    if (!rate.success) {
      return apiError("Too many requests", 429);
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const company = typeof body?.company === "string" ? body.company.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!name || !phone) {
      return apiError("Invalid payload", 400);
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!course) {
      return apiError("Not found", 404);
    }

    await db.lead.create({
      data: {
        name,
        company: company || null,
        email: email || null,
        phone,
        courseId: course.id,
      },
    });

    const whatsappNumber = "971557028756";
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `New brochure download lead: ${name} (${phone})\nCourse: ${course.title}`
    )}`;

    const secret = getSigningSecret();
    if (!secret) {
      return apiError("Missing signing secret", 500);
    }

    const expires = Date.now() + BROCHURE_TTL_MS;
    const signature = signDownload(course.id, expires, secret);

    return NextResponse.json({
      downloadUrl: `/api/courses/${course.id}/brochure?expires=${expires}&signature=${signature}`,
      whatsappLink,
    });
  } catch (error) {
    console.error("[COURSE_BROCHURE_POST]", error);
    return apiError("Internal Error", 500);
  }
}
