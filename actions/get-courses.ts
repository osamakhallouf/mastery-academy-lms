import { Category, Course, UserProgress } from "@prisma/client";
import { db } from "@/lib/db";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string; userProgress?: UserProgress[] }[];
  progress: number | null
}

type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
};

export const getCourses = async ({
  userId,
  title,
  categoryId
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
          mode: "insensitive",
        },
        categoryId,
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
            userProgress: userId ? {
              where: {
                userId,
                isCompleted: true,
              },
              select: {
                id: true,
              }
            } : false,
          }
        },
        purchases: userId ? {
          where: {
            userId,
          }
        } : false
      },
      orderBy: {
        createdAt: "desc",
      }
    });
    
    const coursesWithProgress: CourseWithProgressWithCategory[] = courses.map((course) => {
      if (!userId || course.purchases.length === 0) {
        return {
          ...course,
          progress: null,
        };
      }

      const totalChapters = course.chapters.length;
      const completedChapters = course.chapters.filter(
        (chapter) => (chapter.userProgress?.length ?? 0) > 0
      ).length;

      const progress =
        totalChapters === 0 ? 0 : Math.round((completedChapters / totalChapters) * 100);

      return {
        ...course,
        progress,
      };
    });

    return coursesWithProgress;
  } catch (error) {
    console.error("[GET_COURSES]", error);
    return [];
  }
}