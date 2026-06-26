import { db } from "@/lib/db";
import { Category, Chapter, Course } from "@prisma/client";

import { parsePagination } from "@/lib/pagination";

type CourseWithCategory = Course & {
  category: Category;
  chapters: Chapter[];
};

export type GetDashboardCoursesParams = {
  userId: string;
  take?: number;
  skip?: number;
  page?: number;
  limit?: number;
};

export type GetDashboardCoursesResult = {
  items: CourseWithCategory[];
  total: number;
  totalCompleted: number;
  totalInProgress: number;
  hasMore: boolean;
};

export const getDashboardCourses = async (
  userId: string,
  paginationInput?: { take?: number; skip?: number; page?: number; limit?: number }
): Promise<GetDashboardCoursesResult> => {
  try {
    const { skip, take } = parsePagination(paginationInput ?? {});

    const purchasedCourses = await db.purchase.findMany({
      where: { userId },
      select: {
        course: {
          include: {
            category: true,
            chapters: { where: { isPublished: true } },
          },
        },
      },
    });

    const courses = purchasedCourses.map(
      (p) => p.course
    ) as (Course & { category: Category; chapters: Chapter[] })[];

    const total = courses.length;
    const items = courses.slice(skip, skip + take);

    return {
      items,
      total,
      totalCompleted: 0,
      totalInProgress: 0,
      hasMore: skip + items.length < total,
    };
  } catch (error) {
    console.error("[GET_DASHBOARD_COURSES]", error);
    return {
      items: [],
      total: 0,
      totalCompleted: 0,
      totalInProgress: 0,
      hasMore: false,
    };
  }
};