import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();
    const list = Array.isArray(body?.list) ? body.list : [];

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!ownCourse) {
      return apiError("Unauthorized", 401);
    }

    const courseChapterIds = await db.chapter.findMany({
      where: { courseId: params.courseId },
      select: { id: true },
    });
    const allowedIds = new Set(courseChapterIds.map((c) => c.id));

    const invalidItem = list.find(
      (item: { id?: unknown; position?: unknown }) =>
        typeof item?.id !== "string" || !allowedIds.has(item.id)
    );
    if (invalidItem !== undefined) {
      return apiError("All chapter IDs must belong to this course", 400);
    }

    await db.$transaction(
      list.map((item: { id: string; position: number }) =>
        db.chapter.update({
          where: { id: item.id, courseId: params.courseId },
          data: { position: item.position },
        })
      )
    );

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[REORDER]", error);
    return apiError("Internal Error", 500);
  }
}
