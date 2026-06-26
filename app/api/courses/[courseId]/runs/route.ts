import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import {
  validateRequest,
  validationErrorResponse,
} from "@/lib/validate-request";

const createRunSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    location: z.string().optional(),
    capacity: z.number().int().min(0).optional().nullable(),
  })
  .strict();

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
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

    const validation = await validateRequest(createRunSchema, req);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { startDate, endDate, location, capacity } = validation.data;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const run = await db.courseRun.create({
      data: {
        courseId: params.courseId,
        startDate: start,
        endDate: end,
        location: location ?? null,
        capacity: capacity ?? null,
      },
    });

    return NextResponse.json(run);
  } catch (error) {
    console.error("[COURSE_RUNS_POST]", error);
    return apiError("Internal Error", 500);
  }
}
