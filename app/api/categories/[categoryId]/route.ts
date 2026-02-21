import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";

export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId || !isTeacher(userId)) {
      return apiError("Unauthorized", 401);
    }

    // Check if category is used by any course
    const coursesWithCategory = await db.course.findFirst({
      where: {
        categoryId: params.categoryId,
      },
    });

    if (coursesWithCategory) {
      return NextResponse.json(
        { error: "Cannot delete category that is in use" },
        { status: 400 }
      );
    }

    await db.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORIES_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}
