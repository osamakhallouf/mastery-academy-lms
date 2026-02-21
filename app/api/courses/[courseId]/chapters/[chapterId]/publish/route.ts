import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params : { courseId: string; chapterId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return apiError("Unauthorized", 401);
        }

        const ownCourse = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId
            }
        }); 

        if (!ownCourse) {
            return apiError("Unauthorized", 401);
        }     

        const chapter = await db.chapter.findUnique({
            where: {
                id: params.chapterId,
                courseId: params.courseId
            }
        });

        if (!chapter || !chapter.title || !chapter.description) {
            return apiError("Missing required fields", 400);
        }

        const publishedChapter = await db.chapter.update({
            where: {
                id: params.chapterId,
                courseId: params.courseId,
            },
            data: {
                isPublished: true,
            }
        });

      return NextResponse.json(publishedChapter);
    } catch (error) {
        console.error("CHAPTER_PUBLISH", error);
        return apiError("Internal Error", 500);
    }
}