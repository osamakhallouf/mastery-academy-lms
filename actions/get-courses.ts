import { Category, Course } from "@prisma/client";

import { parsePagination } from "@/lib/pagination";
import { db } from "@/lib/db";

export type CourseRunForList = {
  id: string;
  courseId: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  capacity: number | null;
};

type CourseWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  courseRuns?: CourseRunForList[];
};

const getCoursesWhere = (opts: {
  title?: string;
  categoryId?: string | null;
  city?: string | null;
  month?: string | null; // YYYY-MM
}) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  type RunWhere = {
    startDate: { gte: Date; lt?: Date };
    location?: { equals: string; mode: "insensitive" };
  };
  let courseRunWhere: RunWhere = { startDate: { gte: now } };
  if (opts.month && /^\d{4}-\d{2}$/.test(opts.month)) {
    const [y, m] = opts.month.split("-").map(Number);
    courseRunWhere.startDate = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
  }
  if (opts.city != null && opts.city !== "") {
    courseRunWhere.location = { equals: opts.city, mode: "insensitive" as const };
  }
  const needRunFilter = (opts.city != null && opts.city !== "") || (opts.month != null && opts.month !== "");
  return {
    isPublished: true,
    ...(opts.title != null && opts.title !== ""
      ? { title: { contains: opts.title, mode: "insensitive" as const } }
      : {}),
    ...(opts.categoryId != null && opts.categoryId !== ""
      ? { categoryId: opts.categoryId }
      : {}),
    ...(needRunFilter ? { courseRuns: { some: courseRunWhere } } : {}),
  };
};

export type GetCoursesParams = {
  userId: string;
  title?: string;
  categoryId?: string;
  city?: string;
  month?: string; // YYYY-MM
  take?: number;
  skip?: number;
  page?: number;
  limit?: number;
};

export type GetCoursesResult = {
  courses: (CourseWithCategory & { courseRuns?: CourseRunForList[] })[];
  total: number;
  hasMore: boolean;
};

export const getCourses = async ({
  userId,
  title,
  categoryId,
  city,
  month,
  ...paginationInput
}: GetCoursesParams): Promise<GetCoursesResult> => {
  try {
    const { skip, take } = parsePagination(paginationInput);
    const where = getCoursesWhere({ title, categoryId, city, month });
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let runWhere: { startDate: { gte: Date; lt?: Date } } = { startDate: { gte: now } };
    if (month && /^\d{4}-\d{2}$/.test(month as string)) {
      const [y, m] = month.split("-").map(Number);
      runWhere = { startDate: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) } };
    }

    const [total, courses] = await Promise.all([
      db.course.count({ where }),
      db.course.findMany({
        where,
        include: {
          category: true,
          chapters: {
            where: { isPublished: true },
            select: { id: true },
          },
          courseRuns: {
            where: runWhere,
            select: {
              id: true,
              courseId: true,
              startDate: true,
              endDate: true,
              location: true,
              capacity: true,
            },
            orderBy: { startDate: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);

    return {
      courses: courses as (CourseWithCategory & { courseRuns?: CourseRunForList[] })[],
      total,
      hasMore: skip + courses.length < total,
    };
  } catch (error) {
    console.error("[GET_COURSES]", error);
    return { courses: [], total: 0, hasMore: false };
  }
};