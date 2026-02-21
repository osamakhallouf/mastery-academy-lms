import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";

const rateSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
});

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) {
      return apiError("courseId is required", 400);
    }

    const rating = await db.rating.findUnique({
      where: {
        userId_courseId: { userId: user.id, courseId },
      },
      select: { rating: true },
    });

    return NextResponse.json(rating ? { rating: rating.rating } : { rating: 0 });
  } catch (error) {
    console.error("[RATINGS_GET]", error);
    return apiError("Failed to fetch rating", 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();
    const parsed = rateSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join("; ") || "Invalid payload";
      return apiError(message, 400);
    }

    const { courseId, rating } = parsed.data;
    const userId = user.id;

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      return apiError("Course not found", 404);
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      select: { id: true },
    });
    if (!purchase) {
      return apiError("You must purchase the course before rating it", 403);
    }

    await db.rating.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      update: { rating },
      create: {
        userId,
        courseId,
        rating,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RATINGS]", error);
    return apiError("Failed to save rating", 500);
  }
}
