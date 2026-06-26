import { db } from "@/lib/db";

/** Returns distinct months (YYYY-MM) that have upcoming course runs, sorted ascending. */
export async function getCourseMonths(): Promise<string[]> {
  const now = new Date();
  const runs = await db.courseRun.findMany({
    where: {
      startDate: { gte: now },
      course: { isPublished: true },
    },
    select: { startDate: true },
    orderBy: { startDate: "asc" },
  });
  const months = new Set<string>();
  runs.forEach((r) => {
    const d = new Date(r.startDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    months.add(`${y}-${m}`);
  });
  return [...months].sort();
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export { monthLabel };
