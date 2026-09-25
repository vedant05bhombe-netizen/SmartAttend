import React from 'react'
import { Link } from 'react-router-dom'
import { ScanFace, ShieldCheck, Radar, ArrowRight, Building2, GraduationCap } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-noise-grid relative overflow-hidden">
      <div className="absolute -top-40 -left-40 h-96 w-96 bg-volt/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 h-96 w-96 bg-cyan/10 rounded-full blur-3xl" />

      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-volt/10 border border-volt/30 flex items-center justify-center">
            <ScanFace className="h-5 w-5 text-volt" />
          </div>
          <span className="font-display font-bold tracking-tight">SmartAttend</span>
        </div>
        <Link to="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
          Sign in →
        </Link>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-volt border border-volt/30 bg-volt/5 px-3 py-1 rounded-full mb-6">
            Face recognition · Live · Zero paperwork
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight mb-6">
            Attendance that
            <br />
            <span className="text-gradient">recognizes itself.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-lg mb-10">
            Point a camera at your class. SmartAttend matches every face against
            your roster in real time and marks attendance the instant it's confident — no roll call.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/signup/org" className="group inline-flex items-center gap-2 bg-volt text-ink font-display font-semibold px-6 py-3.5 rounded-xl hover:shadow-volt transition-all">
              <Building2 className="h-4 w-4" /> Register your institute
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/signup/student" className="inline-flex items-center gap-2 border border-edge px-6 py-3.5 rounded-xl font-display font-semibold text-white/80 hover:border-volt/50 hover:text-volt transition-all">
              <GraduationCap className="h-4 w-4" /> I'm a student
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-24">
          {[
            { icon: ScanFace, title: 'ArcFace matching', desc: 'Multi-embedding recognition with live voting to reject false positives.' },
            { icon: ShieldCheck, title: 'Anti-spoof built in', desc: 'Photo and screen replay attacks are rejected before a match is even attempted.' },
            { icon: Radar, title: 'Live session sync', desc: 'Attendance only marks against a lecture your admin has actually started.' },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6">
              <f.icon className="h-6 w-6 text-volt mb-4" strokeWidth={1.5} />
              <p className="font-display font-semibold mb-1.5">{f.title}</p>
              <p className="text-sm text-white/40">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
