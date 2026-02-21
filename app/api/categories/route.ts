import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId || !isTeacher(userId)) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: { name },
    });

    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error("[CATEGORIES_POST]", error);
    const isConflict =
      error && typeof error === "object" && "code" in error && error.code === "P2002";
    if (isConflict) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return apiError("Internal Error", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();

    if (!userId || !isTeacher(userId)) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();
    const categoryId =
      typeof body?.categoryId === "string" ? body.categoryId.trim() : "";

    if (!categoryId) {
      return NextResponse.json(
        { error: "CategoryId is required" },
        { status: 400 }
      );
    }

    const coursesWithCategory = await db.course.findFirst({
      where: {
        categoryId,
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
        id: categoryId,
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
