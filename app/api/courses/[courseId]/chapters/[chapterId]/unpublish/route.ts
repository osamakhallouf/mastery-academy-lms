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


        const unpublishedChapter = await db.$transaction(async (tx) => {
            const chapter = await tx.chapter.update({
                where: {
                    id: params.chapterId,
                    courseId: params.courseId,
                },
                data: {
                    isPublished: false,
                },
            });

            const publishedChaptersInCourse = await tx.chapter.findMany({
                where: {
                    courseId: params.courseId,
                    isPublished: true,
                },
            });

            if (publishedChaptersInCourse.length === 0) {
                await tx.course.update({
                    where: {
                        id: params.courseId,
                    },
                    data: {
                        isPublished: false,
                    },
                });
            }

            return chapter;
        });

      return NextResponse.json(unpublishedChapter);
    } catch (error) {
        console.error("CHAPTER_UNPUBLISH", error);
        return apiError("Internal Error", 500);
    }
}