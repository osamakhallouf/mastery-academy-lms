import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; runId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId || !isTeacher(userId)) {
      return apiError("Unauthorized", 401);
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!course) {
      return apiError("Not found", 404);
    }

    const run = await db.courseRun.findFirst({
      where: {
        id: params.runId,
        courseId: params.courseId,
      },
    });

    if (!run) {
      return apiError("Run not found", 404);
    }

    await db.courseRun.delete({
      where: { id: params.runId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COURSE_RUN_DELETE]", error);
    return apiError("Internal Error", 500);
  }
}
