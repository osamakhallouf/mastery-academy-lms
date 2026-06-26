import * as cheerio from "cheerio";
import crypto from "crypto";
import { jsPDF } from "jspdf";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { sendResendEmail } from "@/lib/resend";
import { stripLeadingAiPhrases } from "@/lib/description-clean";

const sanitizeText = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();

/** Remove AI artifacts and noise from a single line. */
const cleanBrochureLine = (line: string): string => {
  let s = line.trim();
  const patterns = [
    /^gemini said[:\s]*/i,
    /^sure!?\s*/i,
    /^note:\s*/i,
    /^\(gemini\)\s*/i,
    /^according to [^:]+:\s*/i,
  ];
  for (const p of patterns) {
    s = s.replace(p, "").trim();
  }
  return s;
};

/** Detect if description contains HTML tags. */
const hasHtmlTags = (text: string): boolean => /<[a-z][^>]*>/i.test(text);

/**
 * Parse HTML description into structured content using cheerio.
 * Returns { about: string[], objectives: string[], outline: string[] }.
 */
function htmlToStructuredContent(html: string): {
  about: string[];
  objectives: string[];
  outline: string[];
} {
  const about: string[] = [];
  const objectives: string[] = [];
  const outline: string[] = [];

  if (!html || typeof html !== "string") {
    return { about, objectives, outline };
  }

  const $ = cheerio.load(html);
  let currentSection: "about" | "objectives" | "outline" = "about";

  const objectivesHeadings = [
    "key learning objectives",
    "learning objectives",
    "objectives",
    "learning outcomes",
    "key takeaways",
  ];
  const outlineHeadings = [
    "core modules",
    "course outline",
    "outline",
    "modules",
    "syllabus",
    "topics",
    "course content",
  ];

  const normalizeHeading = (raw: string) =>
    raw
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  $("p, h1, h2, h3, ul, ol").each((_, el) => {
    const tag = el.tagName?.toLowerCase() ?? "";
    const $el = $(el);
    const text = $el.text().trim();
    const htmlText = $el.html() ?? "";

    if (tag === "ul" || tag === "ol") {
      $el.find("li").each((__, li) => {
        const item = cleanBrochureLine($(li).text().trim());
        if (!item) return;
        if (currentSection === "objectives") objectives.push(item);
        else if (currentSection === "outline") outline.push(item);
        else about.push(`- ${item}`);
      });
      return;
    }

    if (tag === "p" || tag.startsWith("h")) {
      const headingMatch = normalizeHeading(htmlText);
      if (objectivesHeadings.some((h) => headingMatch.includes(h) || headingMatch === h)) {
        currentSection = "objectives";
        return;
      }
      if (outlineHeadings.some((h) => headingMatch.includes(h) || headingMatch === h)) {
        currentSection = "outline";
        return;
      }
    }

    const cleaned = cleanBrochureLine(text);
    if (!cleaned) return;
    if (currentSection === "objectives") objectives.push(cleaned);
    else if (currentSection === "outline") outline.push(cleaned);
    else about.push(cleaned);
  });

  return { about, objectives, outline };
}

/** Section names (case-insensitive): Core Modules + Key Learning Objectives in Course Description. */
const OBJECTIVES_HEADINGS = [
  "key learning objectives",
  "learning objectives",
  "objectives",
  "learning outcomes",
  "key takeaways",
];
const OUTLINE_HEADINGS = [
  "core modules",
  "course outline",
  "outline",
  "modules",
  "syllabus",
  "topics",
  "course content",
];

/** Detect if a line looks like a section heading (e.g. ## X, **X**, or "X:" on its own). */
const isSectionHeading = (line: string): boolean => {
  const t = line.trim();
  if (/^#{1,3}\s+.+/.test(t)) return true;
  if (/^\*\*.+\*\*$/.test(t)) return true;
  if (/^[-*]\s*\*\*.+\*\*\s*$/.test(t)) return true;
  if (/^[A-Za-z][^:\n]{2,60}:\s*$/.test(t) && !t.startsWith("-") && !t.startsWith("*")) return true;
  return false;
};

/** Normalize section title for matching (lowercase, no markdown). */
const normalizeSectionTitle = (raw: string): string => {
  return raw
    .replace(/^#+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/^[-*]\s*/, "")
    .trim()
    .toLowerCase()
    .replace(/:?\s*$/, "");
};

/** Check if line is a bullet (starts with -, *, •, or digit. ). */
const isBulletLine = (line: string): boolean => {
  const t = line.trim();
  return /^[-*•]\s+/.test(t) || /^\d+[.)]\s+/.test(t) || /^\.\s+/.test(t);
};

/** Extract bullet text (strip leading - * • or number. ). */
const toBulletText = (line: string): string => {
  const t = line.trim();
  const bullet = t.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "").replace(/^\.\s+/, "").trim();
  return cleanBrochureLine(bullet);
};

/**
 * Parse course description into sections by headings.
 * Returns { objectives: string[], outline: string[], aboutLines: string[] }.
 */
function parseDescriptionSections(description: string): {
  objectives: string[];
  outline: string[];
  aboutLines: string[];
} {
  const objectives: string[] = [];
  const outline: string[] = [];
  const aboutLines: string[] = [];

  if (!description || typeof description !== "string") {
    return { objectives, outline, aboutLines };
  }

  const lines = description.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let currentSection: "objectives" | "outline" | "about" = "about";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isSectionHeading(line)) {
      const title = normalizeSectionTitle(line);
      if (OBJECTIVES_HEADINGS.some((h) => title.includes(h) || title === h)) {
        currentSection = "objectives";
        continue;
      }
      if (OUTLINE_HEADINGS.some((h) => title.includes(h) || title === h)) {
        currentSection = "outline";
        continue;
      }
      if (currentSection === "about") {
        aboutLines.push(cleanBrochureLine(line));
      }
      continue;
    }

    if (isBulletLine(line)) {
      const text = toBulletText(line);
      if (!text) continue;
      if (currentSection === "objectives") objectives.push(text);
      else if (currentSection === "outline") outline.push(text);
      else aboutLines.push(`- ${text}`);
      continue;
    }

    const cleaned = cleanBrochureLine(line);
    if (!cleaned) continue;
    if (currentSection === "objectives") objectives.push(cleaned);
    else if (currentSection === "outline") outline.push(cleaned);
    else aboutLines.push(cleaned);
  }

  return { objectives, outline, aboutLines };
}

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

/** Valid email format. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/** Name: 2-100 chars, at least 2 letters (Latin or Arabic). Allows spaces, hyphens, apostrophes. */
function isValidBrochureName(name: string): boolean {
  const t = name.trim();
  if (t.length < 2 || t.length > 100) return false;
  const letters = t.match(/[A-Za-z\u0600-\u06FF\u0750-\u077F]/g);
  return (letters?.length ?? 0) >= 2;
}

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

const LINE_HEIGHT = 14;
const MARGIN = 48;
const MAX_WIDTH = 90;

type CourseForBrochure = {
  id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  category: { name: string | null } | null;
};

/** Build brochure lines + footer from course (shared by GET and POST). */
function getBrochureLinesAndFooter(course: CourseForBrochure): {
  lines: string[];
  footerLines: string[];
} {
  const courseTitle =
    (typeof course.title === "string" && course.title.trim()) || "Untitled Course";
  const categoryName =
    (course.category?.name && course.category.name.trim()) || "General";
  const descriptionText =
    typeof course.description === "string" && course.description.trim()
      ? stripLeadingAiPhrases(course.description.trim())
      : "";

  let objectives: string[];
  let outline: string[];
  let aboutLines: string[];

  if (hasHtmlTags(descriptionText)) {
    const parsed = htmlToStructuredContent(descriptionText);
    objectives = parsed.objectives;
    outline = parsed.outline;
    aboutLines = parsed.about;
  } else {
    const parsed = parseDescriptionSections(descriptionText);
    objectives = parsed.objectives;
    outline = parsed.outline;
    aboutLines = parsed.aboutLines;
  }

  const priceLabel =
    course.price != null && course.price > 0
      ? `Price: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(course.price)}`
      : "Available upon corporate request";

  const appUrl = (env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const footerLines = [
    "---",
    "Mastery Academy",
    appUrl ? `Website: ${appUrl}` : "",
    "Request a Group Quote: Contact us via the website or WhatsApp +971557028756",
  ].filter(Boolean);

  const lines = [
    "Mastery Academy - Course Brochure",
    `Course: ${courseTitle}`,
    `Category: ${categoryName}`,
    "",
    "About the Course:",
    ...(aboutLines.length
      ? aboutLines.flatMap((l) => (l.startsWith("-") ? [l] : wrapLine(l)))
      : descriptionText
        ? wrapLine(cleanBrochureLine(descriptionText.slice(0, 800)))
        : ["Course description will be updated soon."]),
    "",
    "Target Audience:",
    "- Corporate leaders and managers",
    "- Quality and operations professionals",
    "- Technology and transformation teams",
    "",
    "Key Learning Objectives:",
    ...(objectives.length
      ? objectives.map((o) => `- ${o}`)
      : ["- Objectives will be shared upon request"]),
    "",
    "Core Modules / Outline:",
    ...(outline.length
      ? outline.map((item, index) => `${index + 1}. ${item}`)
      : ["Outline will be published soon."]),
    "",
    priceLabel,
    "",
  ];

  if (lines.length === 0) {
    lines.push("This brochure has no content yet. Please check back later.");
  }

  return { lines, footerLines };
}

/** Build PDF buffer and filename for a course (for GET download or email attachment). */
function buildBrochurePdfForCourse(course: CourseForBrochure): {
  buffer: Buffer;
  filename: string;
} {
  const { lines, footerLines } = getBrochureLinesAndFooter(course);
  const buffer = buildPdfWithJsPDF(lines, footerLines);
  const courseTitle =
    (typeof course.title === "string" && course.title.trim()) || "course";
  const filename = `course-brochure-${sanitizeText(courseTitle) || "course"}.pdf`;
  return { buffer, filename };
}

/** Build PDF using jsPDF with structured content. */
const buildPdfWithJsPDF = (
  lines: string[],
  footerLines: string[] = []
): Buffer => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxTextWidth = pageWidth - MARGIN * 2;

  let y = 72;

  const addText = (text: string, fontSize: number, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    const wrapped = doc.splitTextToSize(sanitizeText(text), maxTextWidth);
    for (const line of wrapped) {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
  };

  const addLine = (line: string, isHeader = false) => {
    addText(line || " ", isHeader ? 14 : 11, isHeader);
  };

  if (lines.every((s) => !s || s.length === 0)) {
    addLine("No content available for this brochure.");
  } else {
    for (const line of lines) {
      const isHeader =
        line === "Mastery Academy - Course Brochure" ||
        line === "About the Course:" ||
        line === "Target Audience:" ||
        line === "Key Learning Objectives:" ||
        line === "Core Modules / Outline:";
      addLine(line, isHeader);
    }
  }

  if (footerLines.length > 0) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = MARGIN;
    }
    y += LINE_HEIGHT;
    for (const line of footerLines) {
      addLine(line);
    }
  }

  const output = doc.output("arraybuffer");
  return Buffer.from(output);
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
        price: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!course) {
      return apiError("Not found", 404);
    }

    const { buffer, filename } = buildBrochurePdfForCourse(course);

    return new NextResponse(buffer, {
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
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!name || !phone || !email) {
      return apiError("Name, email, and phone are required", 400);
    }

    if (!isValidEmail(email)) {
      return apiError("Please enter a valid email address", 400);
    }

    if (!isValidBrochureName(name)) {
      return apiError(
        "Name must be 2–100 characters and contain only letters, spaces, hyphens, or apostrophes",
        400
      );
    }

    const resendKey = env.RESEND_API_KEY?.trim();
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
    if (!resendKey || !fromEmail) {
      return apiError(
        "Brochure delivery by email is not configured. Please try again later.",
        503
      );
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
        price: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!course) {
      return apiError("Not found", 404);
    }

    const { buffer, filename } = buildBrochurePdfForCourse(course);

    const appUrl = (env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
    const courseTitle =
      (typeof course.title === "string" && course.title.trim()) || "Course";

    const result = await sendResendEmail({
      to: email,
      subject: `Your brochure: ${courseTitle}`,
      html: `
        <p>Hello ${sanitizeText(name)},</p>
        <p>Please find your course brochure attached.</p>
        <p>If you have any questions, contact us via our website or WhatsApp.</p>
        <p>— Mastery Academy${appUrl ? `<br><a href="${appUrl}">${appUrl}</a>` : ""}</p>
      `,
      attachments: [
        {
          filename,
          content: buffer.toString("base64"),
          contentType: "application/pdf",
        },
      ],
    });

    if (!result.ok) {
      console.error(
        "[COURSE_BROCHURE_POST] Resend failed:",
        result.error ?? "unknown"
      );
      return apiError(
        "We could not send the brochure to your email. Please try again later.",
        502
      );
    }

    await db.lead.create({
      data: {
        name,
        company: null,
        email,
        phone,
        courseId: course.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "The brochure has been sent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.error("[COURSE_BROCHURE_POST]", error);
    return apiError("Internal Error", 500);
  }
}
