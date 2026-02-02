import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; attachmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const rate = rateLimit(`attachments:${userId}`, {
      limit: 10,
      windowMs: 60_000,
    });

    if (!rate.success) {
      return new NextResponse("Too many requests. Please try again later.", {
        status: 429,
      });
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
      return new NextResponse("Not found", { status: 404 });
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
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.redirect(attachment.url);
  } catch (error) {
    console.error("[ATTACHMENT_DOWNLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
