import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";
import { CheckCircle, Clock } from "lucide-react";

import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { InfoCard } from "./_components/info-card";


interface DashboardPageProps {
  searchParams: { page?: string; limit?: string };
}

export default async function Dashboard({
  searchParams,
}: DashboardPageProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const {
    items,
    totalCompleted,
    totalInProgress,
  } = await getDashboardCourses(userId, {
    page: searchParams.page ? Number(searchParams.page) : undefined,
    limit: searchParams.limit ? Number(searchParams.limit) : undefined,
  });

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItems={totalInProgress}
        />
        <InfoCard
          icon={CheckCircle}
          label="Completed"
          numberOfItems={totalCompleted}
          variant="success"
        />
      </div>
      <CoursesList items={items} />
    </div>
  );
}
