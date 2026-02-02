import { db } from "@/lib/db";
import { Category, Chapter, Course } from "@prisma/client";
import { getProgress } from "@/actions/get-progress";

type CourseWithProgressWithCategory = Course & {
    category: Category;
    chapters: Chapter[];
    progress: number | null;
};

type DashboardCourses = {
    completedCourses: CourseWithProgressWithCategory[];
    coursesInProgress: CourseWithProgressWithCategory[];
}

export const getDashboardCourses = async (userId: string): Promise<DashboardCourses> => {
    try {

        const purchasedCourses = await db.purchase.findMany({
            where: {
                userId
            },
            select: {
                course: {
                    include: {
                        category: true,
                        chapters: {
                            where: {
                                isPublished: true,
                            }
                        }
                    }
                }
            }
        });

        const courses = purchasedCourses.map((purchase) => purchase.course) as CourseWithProgressWithCategory[];

        const coursesWithProgress = await Promise.all(
            courses.map(async (course) => ({
                ...course,
                progress: await getProgress(userId, course.id),
            }))
        );

        const completedCourses = coursesWithProgress.filter((course) => course.progress === 100);

        const coursesInProgress = coursesWithProgress.filter((course) => (course.progress ?? 0) < 100);

        return {
            completedCourses,
            coursesInProgress,
        }

    } catch (error) {
        console.error("[GET_DASHBOARD_COURSES]: ", error);
        return  {
            completedCourses: [],
            coursesInProgress: [],
        }
    }
}