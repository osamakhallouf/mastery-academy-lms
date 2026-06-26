import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { getMuxVideo } from "@/lib/mux";
import { isTeacher } from "@/lib/teacher";
import {
  validateRequest,
  validationErrorResponse,
} from "@/lib/validate-request";

const patchCourseSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    price: z.number().min(0).nullable().optional(),
    categoryId: z.string().uuid().nullable().optional(),
    isPublished: z.boolean().optional(),
  })
  .strict();

export async function DELETE(
    req:Request,
    {params}: { params: { courseId:string } }
) {
    try {
      const { userId } = auth();

      if (!userId || !isTeacher(userId)) {
        return apiError("Unauthorized", 401);
      }

      const course = await db.course.findUnique({
        where: {
            id: params.courseId,
            userId: userId,
        },
        include: {
            chapters: {
                include: {
                    muxData: true,
                }
            }
        }
      });

      if (!course) {
        return apiError("Not found", 404);
      }

      const Video = getMuxVideo();
      for (const chapter of course.chapters) {
        if (chapter.muxData?.assetId && Video) {
          await Video.Assets.del(chapter.muxData.assetId);
        }
      }

      const deletedCourse = await db.course.delete({
        where: {
            id: params.courseId,
        },
      });

      return NextResponse.json(deletedCourse);
    } catch (error) {
        console.error("[COURSE_ID_DELETE]", error);
        return apiError("Internal Error", 500);
    }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;

    if (!userId || !isTeacher(userId)) {
      return apiError("Unauthorized", 401);
    }

    const validation = await validateRequest(patchCourseSchema, req);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = Object.fromEntries(
      Object.entries(validation.data).filter(([, v]) => v !== undefined)
    );

    const course = await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data,
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_ID]", error);
    return apiError("Internal Error", 500);
  }
}