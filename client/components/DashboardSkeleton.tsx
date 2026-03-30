export default function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-10 bg-card border border-slate-200 dark:border-slate-800 rounded-[2.5rem] h-52 animate-pulse"
        >
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4 mb-4" />
          <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-lg w-1/2" />

          <div className="mt-10 flex items-center gap-3">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="space-y-2">
               <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-full w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}