export default function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-10 bg-white border border-slate-100 rounded-[2.5rem] h-50 animate-pulse"
        >
          <div className="h-8 bg-slate-100 rounded-xl w-3/4 mb-4" />
          <div className="h-4 bg-slate-50 rounded-lg w-1/2" />

          <div className="mt-8 flex items-center gap-2">
            <div className="h-3 bg-slate-50 rounded-full w-20" />
            <div className="h-3 bg-slate-50 rounded-full w-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
