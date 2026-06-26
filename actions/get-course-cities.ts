import { db } from "@/lib/db";

/** Returns distinct non-empty location (city) values from upcoming course runs. */
export async function getCourseCities(): Promise<string[]> {
  const now = new Date();
  const runs = await db.courseRun.findMany({
    where: {
      startDate: { gte: now },
      location: { not: null },
      course: { isPublished: true },
    },
    select: { location: true },
    distinct: ["location"],
    orderBy: { location: "asc" },
  });
  const locations = runs
    .map((r) => (r.location || "").trim())
    .filter((loc) => loc.length > 0);
  return [...new Set(locations)].sort((a, b) => a.localeCompare(b));
}
