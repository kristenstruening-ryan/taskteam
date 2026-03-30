"use client";

import Link from "next/link";
import { Zap, Layout, MessageSquare, ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] overflow-hidden">
      <section className="relative pt-32 pb-40 px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-[0.3em] uppercase mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles size={12} />
            System Version 1.0 Beta
          </div>

          <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter mb-10 leading-[0.9] antialiased">
            Manage tasks. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-blue-500">
              Sync teams.
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-14 font-medium leading-relaxed">
            The collaborative command center where mission-critical discussion
            happens right inside your task cards. Stop context switching.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/signup"
              className="group relative bg-white text-[#0f172a] px-10 py-5 rounded-4xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
            >
              Initialize Workspace
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-slate-400 hover:text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all group"
            >
              Access Portal
              <ArrowRight
                size={16}
                className="group-hover:translate-x-2 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative bg-[#1e293b]/30 py-32 px-8 border-t border-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <FeatureCard
              icon={
                <Zap className="text-indigo-400" size={24} strokeWidth={2.5} />
              }
              title="Real-time Mentions"
              desc="Tag teammates with @identity to trigger instant system notifications. Eliminate communication lag."
            />
            <FeatureCard
              icon={
                <Layout
                  className="text-indigo-400"
                  size={24}
                  strokeWidth={2.5}
                />
              }
              title="Tactical Boards"
              desc="Organize tasks into distinct mission boards. Drag, drop, and conquer your backlog with ease."
            />
            <FeatureCard
              icon={
                <MessageSquare
                  className="text-indigo-400"
                  size={24}
                  strokeWidth={2.5}
                />
              }
              title="Contextual Sync"
              desc="Comments live inside the task geometry. Keep your feedback loops tight, documented, and secure."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-6 group">
      <div className="w-16 h-16 bg-[#0f172a] rounded-3xl shadow-2xl flex items-center justify-center border-2 border-slate-800 transition-all group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/10">
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-black text-white tracking-tight">
          {title}
        </h3>
        <p className="text-slate-500 leading-relaxed text-sm font-medium pr-4">
          {desc}
        </p>
      </div>
    </div>
  );
}
