import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; attachmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const rate = await rateLimit(`attachments:${userId}`, {
      limit: 10,
      windowMs: 60_000,
    });

    if (!rate.success) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const attachment = await db.attachment.findUnique({
      where: {
        id: params.attachmentId,
        courseId: params.courseId,
      },
      include: {
        course: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!attachment) {
      return apiError("Not found", 404);
    }

    const isOwner = attachment.course.userId === userId;
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    });

    if (!isOwner && !purchase) {
      return apiError("Forbidden", 403);
    }

    return NextResponse.redirect(attachment.url);
  } catch (error) {
    console.error("[ATTACHMENT_DOWNLOAD]", error);
    return apiError("Internal Error", 500);
  }
}
