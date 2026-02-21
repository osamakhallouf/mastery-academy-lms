import { db } from "@/lib/db";
import { Category, Chapter, Course } from "@prisma/client";

import { parsePagination } from "@/lib/pagination";

type CourseWithProgressWithCategory = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
};

export type GetDashboardCoursesParams = {
  userId: string;
  take?: number;
  skip?: number;
  page?: number;
  limit?: number;
};

export type GetDashboardCoursesResult = {
  items: CourseWithProgressWithCategory[];
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

    const allChapterIds = courses.flatMap((c) => c.chapters.map((ch) => ch.id));
    const completedChapterIds = new Set<string>();

    if (allChapterIds.length > 0) {
      const progressRecords = await db.userProgress.findMany({
        where: {
          userId,
          chapterId: { in: allChapterIds },
          isCompleted: true,
        },
        select: { chapterId: true },
      });
      progressRecords.forEach((r) => completedChapterIds.add(r.chapterId));
    }

    const coursesWithProgress: CourseWithProgressWithCategory[] = courses.map(
      (course) => {
        const total = course.chapters.length;
        const completed =
          total === 0
            ? 0
            : course.chapters.filter((ch) => completedChapterIds.has(ch.id))
                .length;
        const progress =
          total === 0 ? 0 : Math.round((completed / total) * 100);
        return { ...course, progress };
      }
    );

    const coursesInProgress = coursesWithProgress.filter(
      (c) => (c.progress ?? 0) < 100
    );
    const completedCourses = coursesWithProgress.filter((c) => c.progress === 100);
    const combined = [...coursesInProgress, ...completedCourses];
    const total = combined.length;
    const items = combined.slice(skip, skip + take);

    return {
      items,
      total,
      totalCompleted: completedCourses.length,
      totalInProgress: coursesInProgress.length,
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