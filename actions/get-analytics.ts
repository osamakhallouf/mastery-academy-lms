import { db } from "@/lib/db";

import { parsePagination } from "@/lib/pagination";

export type GetAnalyticsParams = {
  take?: number;
  skip?: number;
  page?: number;
  limit?: number;
};

export type GetAnalyticsResult = {
  totalInquiries: number;
  pendingInquiries: number;
  confirmedInquiries: number;
  inquiriesByCourse: { courseTitle: string; count: number }[];
};

export const getAnalytics = async (
  userId: string,
  paginationInput?: GetAnalyticsParams
): Promise<GetAnalyticsResult> => {
  try {
    const myCourseIds = await db.course.findMany({
      where: { userId },
      select: { id: true, title: true },
    });
    const courseIds = myCourseIds.map((c) => c.id);
    const titleById: Record<string, string> = {};
    myCourseIds.forEach((c) => {
      titleById[c.id] = c.title;
    });

    const inquiries = await db.corporateInquiry.findMany({
      where: { courseId: { in: courseIds } },
      include: { confirmationLetter: true },
    });

    const totalInquiries = inquiries.length;
    const confirmedInquiries = inquiries.filter((i) => i.confirmationLetter).length;
    const pendingInquiries = totalInquiries - confirmedInquiries;

    const countByCourse: Record<string, number> = {};
    inquiries.forEach((i) => {
      const key = i.courseId ? titleById[i.courseId] ?? i.courseId : "No course";
      countByCourse[key] = (countByCourse[key] ?? 0) + 1;
    });
    const inquiriesByCourse = Object.entries(countByCourse).map(
      ([courseTitle, count]) => ({ courseTitle, count })
    ).sort((a, b) => b.count - a.count);

    return {
      totalInquiries,
      pendingInquiries,
      confirmedInquiries,
      inquiriesByCourse,
    };
  } catch (error) {
    console.error("[GET_ANALYTICS]", error);
    return {
      totalInquiries: 0,
      pendingInquiries: 0,
      confirmedInquiries: 0,
      inquiriesByCourse: [],
    };
  }
};
