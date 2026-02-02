export const CourseCardSkeleton = () => {
  return (
    <div className="overflow-hidden border rounded-lg p-3 h-full animate-pulse">
      <div className="w-full aspect-video rounded-md bg-slate-200" />
      <div className="flex flex-col pt-3 gap-2">
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
        <div className="h-3 w-1/3 bg-slate-200 rounded" />
        <div className="h-3 w-1/2 bg-slate-200 rounded" />
        <div className="h-4 w-1/4 bg-slate-200 rounded" />
      </div>
    </div>
  );
};
