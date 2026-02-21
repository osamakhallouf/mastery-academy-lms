import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const isCompleted = typeof body?.isCompleted === "boolean" ? body.isCompleted : false;

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
    });

    if (!chapter) {
      return apiError("Chapter not found", 404);
    }

    if (!chapter.isPublished) {
      return apiError("Chapter is not published", 403);
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    });

    const hasAccess = chapter.isFree || purchase !== null;
    if (!hasAccess) {
      return apiError("Access denied. Purchase the course or use a free chapter.", 403);
    }

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId: params.chapterId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        userId,
        chapterId: params.chapterId,
        isCompleted,
      },
    });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error("[CHAPTER_ID_PROGRESS]", error);
    return apiError("Internal Error", 500);
  }
}