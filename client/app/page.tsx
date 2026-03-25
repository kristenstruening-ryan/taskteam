"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6">
            Now in Beta v1.0
          </span>
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
            Manage tasks. <br />
            <span className="text-blue-600">Mention teammates.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            TaskTeam is the collaborative workspace where conversations happen right next to your to-dos. Stop switching tabs and start shipping.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-slate-200"
            >
              Get Started for Free
            </Link>
            <Link
              href="/login"
              className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg transition-all"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-50 py-24 px-8 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon="🔔"
              title="Real-time Mentions"
              desc="Tag teammates with @email to trigger instant notifications. Never miss a pivot."
            />
            <FeatureCard
              icon="📋"
              title="Project Boards"
              desc="Organize tasks into distinct boards. Drag, drop, and conquer your backlog."
            />
            <FeatureCard
              icon="💬"
              title="Contextual Chat"
              desc="Comments live inside tasks. Keep your feedback loops tight and documented."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border border-slate-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}