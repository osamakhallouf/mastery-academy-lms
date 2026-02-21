import { db } from "@/lib/db";
import { Course, Purchase } from "@prisma/client";

import { parsePagination } from "@/lib/pagination";

type PurchaseWithCourse = Purchase & {
  course: Course;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};
  purchases.forEach((purchase) => {
    const courseTitle = purchase.course.title;
    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0;
    }
    grouped[courseTitle] += purchase.course.price ?? 0;
  });
  return grouped;
};

export type GetAnalyticsParams = {
  take?: number;
  skip?: number;
  page?: number;
  limit?: number;
};

export type GetAnalyticsResult = {
  data: { name: string; total: number }[];
  total: number;
  totalRevenue: number;
  totalSales: number;
  hasMore: boolean;
};

export const getAnalytics = async (
  userId: string,
  paginationInput?: GetAnalyticsParams
): Promise<GetAnalyticsResult> => {
  try {
    const { skip, take } = parsePagination(paginationInput ?? {});

    const purchases = await db.purchase.findMany({
      where: { course: { userId } },
      include: { course: true },
    });

    const groupedEarnings = groupByCourse(purchases);
    const fullData = Object.entries(groupedEarnings).map(
      ([courseTitle, total]) => ({ name: courseTitle, total })
    );
    const total = fullData.length;
    const data = fullData.slice(skip, skip + take);

    const totalRevenue = fullData.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = purchases.length;

    return {
      data,
      total,
      totalRevenue,
      totalSales,
      hasMore: skip + data.length < total,
    };
  } catch (error) {
    console.error("[GET_ANALYTICS]", error);
    return {
      data: [],
      total: 0,
      totalRevenue: 0,
      totalSales: 0,
      hasMore: false,
    };
  }
};