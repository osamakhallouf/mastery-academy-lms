import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { getMuxVideo } from "@/lib/mux";
import {
  validateRequest,
  validationErrorResponse,
} from "@/lib/validate-request";

const patchChapterSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    videoUrl: z.string().optional(),
    position: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
    isFree: z.boolean().optional(),
    content: z.string().optional(),
  })
  .strict();

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      }
    });

    if (!ownCourse) {
      return apiError("Unauthorized", 401);
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      }
    });

    if (!chapter) {
      return apiError("Not Found", 404);
    }

    const Video = getMuxVideo();
    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId,
        }
      });

      if (existingMuxData && Video) {
        await Video.Assets.del(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          }
        });
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: params.chapterId
      }
    });

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true,
      }
    });

    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        }
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.error("[CHAPTER_ID_DELETE]", error);
    return apiError("Internal Error", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!ownCourse) {
      return apiError("Unauthorized", 401);
    }

    const validation = await validateRequest(patchChapterSchema, req);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const data = Object.fromEntries(
      Object.entries(validation.data).filter(([, v]) => v !== undefined)
    );

    const chapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data,
    });

    const videoUrl = validation.data.videoUrl;
    if (videoUrl) {
      const Video = getMuxVideo();
      if (!Video) {
        return apiError("Video service not configured", 503);
      }
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId,
        },
      });

      if (existingMuxData) {
        try {
          await Video.Assets.del(existingMuxData.assetId);
        } catch (error) {
          console.error("[Mux Asset Delete]", error);
        }
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }

      try {
        const asset = await Video.Assets.create({
          input: videoUrl,
          playback_policy: "public",
          test: false,
        });

        if (asset) {
          await db.muxData.create({
            data: {
              chapterId: params.chapterId,
              assetId: asset.id,
              playbackId: asset.playback_ids?.[0]?.id,
            },
          });
        }
      } catch (error) {
        console.error("[Mux Asset Create]", error);
      }
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[COURSES_CHAPTER_ID]", error);
    return apiError("Internal Error", 500);
  }
}