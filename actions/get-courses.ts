import { Category, Course, UserProgress } from "@prisma/client";

import { parsePagination } from "@/lib/pagination";
import { db } from "@/lib/db";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string; userProgress?: UserProgress[] }[];
  progress: number | null;
};

const getCoursesWhere = (opts: {
  title?: string;
  categoryId?: string | null;
}) => ({
  isPublished: true,
  ...(opts.title != null && opts.title !== ""
    ? { title: { contains: opts.title, mode: "insensitive" as const } }
    : {}),
  ...(opts.categoryId != null && opts.categoryId !== ""
    ? { categoryId: opts.categoryId }
    : {}),
});

export type GetCoursesParams = {
  userId: string;
  title?: string;
  categoryId?: string;
  take?: number;
  skip?: number;
  page?: number;
  limit?: number;
};

export type GetCoursesResult = {
  courses: CourseWithProgressWithCategory[];
  total: number;
  hasMore: boolean;
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
  ...paginationInput
}: GetCoursesParams): Promise<GetCoursesResult> => {
  try {
    const { skip, take } = parsePagination(paginationInput);
    const where = getCoursesWhere({ title, categoryId });

    const [total, courses] = await Promise.all([
      db.course.count({ where }),
      db.course.findMany({
        where,
        include: {
          category: true,
          chapters: {
            where: { isPublished: true },
            select: {
              id: true,
              userProgress: userId
                ? {
                    where: { userId, isCompleted: true },
                    select: { id: true },
                  }
                : false,
            },
          },
          purchases: userId
            ? { where: { userId } }
            : false,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);

    const coursesWithProgress: CourseWithProgressWithCategory[] = courses.map(
      (course) => {
        if (!userId || (course.purchases?.length ?? 0) === 0) {
          return { ...course, progress: null };
        }
        const totalChapters = course.chapters.length;
        const completedChapters = course.chapters.filter(
          (ch) => (ch.userProgress?.length ?? 0) > 0
        ).length;
        const progress =
          totalChapters === 0
            ? 0
            : Math.round((completedChapters / totalChapters) * 100);
        return { ...course, progress };
      }
    );

    return {
      courses: coursesWithProgress,
      total,
      hasMore: skip + courses.length < total,
    };
  } catch (error) {
    console.error("[GET_COURSES]", error);
    return { courses: [], total: 0, hasMore: false };
  }
};