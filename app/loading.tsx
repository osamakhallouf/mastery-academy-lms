import { CourseCardSkeleton } from "@/components/course-card-skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-[80px] w-full" />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="h-24 rounded-xl bg-slate-200 animate-pulse mb-6" />
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
