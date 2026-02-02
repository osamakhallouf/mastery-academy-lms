export default function CourseDetailsLoading() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="h-56 rounded-2xl bg-slate-800/60 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
          <div className="space-y-6">
            <div className="h-40 rounded-2xl bg-slate-800/60 animate-pulse" />
            <div className="h-64 rounded-2xl bg-slate-800/60 animate-pulse" />
            <div className="h-40 rounded-2xl bg-slate-800/60 animate-pulse" />
          </div>
          <div className="h-96 rounded-2xl bg-slate-800/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
