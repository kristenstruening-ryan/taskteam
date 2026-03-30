import { Activity, Rocket } from "lucide-react";

interface VelocityCardProps {
  velocity: number;
  currentPhase: { title: string; progress: number; status: string } | null;
  onOpenPhaseManager: () => void;
}

export default function VelocityCard({ velocity, currentPhase, onOpenPhaseManager }: VelocityCardProps) {
  return (
    <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/20 flex flex-col justify-between group relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
        <Activity size={40} />
      </div>

      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">
          Project Velocity
        </span>
        <div className="text-5xl font-black text-white mt-2 tracking-tighter italic">
          {velocity}%
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">
            <span>{currentPhase?.title || "No Active Phase"}</span>
            <span className={currentPhase?.status === "At Risk" ? "text-rose-400 animate-pulse" : "text-indigo-200"}>
              {currentPhase?.status || "Standby"}
            </span>
          </div>
          <div className="w-full bg-indigo-950/40 h-3 rounded-full overflow-hidden border border-indigo-400/20">
            <div
              className="bg-white h-full shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-1000 ease-out"
              style={{ width: `${currentPhase?.progress || 0}%` }}
            />
          </div>
        </div>

        <button
          onClick={onOpenPhaseManager}
          className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-indigo-600 rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-3 group/btn"
        >
          <Rocket size={18} className="group-hover/btn:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Manage Strategic Phases</span>
        </button>
      </div>
    </div>
  );
}