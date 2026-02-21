import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";

const ALLOWED_ATTACHMENT_ORIGINS = ["https://utfs.io"] as const;

const attachmentPostSchema = z.object({
  url: z.string().url("url must be a valid URL"),
});

function isAllowedAttachmentUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "https:" && ALLOWED_ATTACHMENT_ORIGINS.some((origin) => url.origin === origin);
  } catch {
    return false;
  }
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();
    const parsed = attachmentPostSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join("; ") || "Invalid payload";
      return apiError(message, 400);
    }

    const { url } = parsed.data;
    if (!isAllowedAttachmentUrl(url)) {
      return apiError("Attachment URL must be from an allowed domain (e.g. https://utfs.io)", 400);
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!courseOwner) {
      return apiError("Unauthorized", 401);
    }

    const attachment = await db.attachment.create({
      data: {
        url,
        name: url.split("/").pop() ?? "attachment",
        courseId: params.courseId,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("COURSE_ID_ATTACHMENTS", error);
    return apiError("Internal Error", 500);
  }
}
