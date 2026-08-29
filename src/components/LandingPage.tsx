"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(30px)",
      transition: `all 0.8s cubic-bezier(0.32, 0.72, 0, 1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function TextReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        opacity: visible ? 1 : 0,
        transition: `all 1.2s cubic-bezier(0.32, 0.72, 0, 1) ${delay}ms`,
      }}>
        {children}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen text-[#F3F4F6] relative overflow-x-hidden landing-mesh">

      {/* ── NAV ────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] h-20 px-8 md:px-16 flex items-center justify-between transition-all duration-500"
        style={{
          background: scrolled ? "rgba(10,10,10,0.8)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
      >
        <Link href="/" className="text-xl font-black tracking-tighter text-white group flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--cyan)] rounded-full group-hover:scale-150 transition-transform duration-500" />
          FINMATE
        </Link>
        <div className="flex items-center gap-12">
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 hover:text-[var(--cyan)] transition-colors duration-300">Intelligence</a>
            <a href="#showcase" className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 hover:text-[var(--cyan)] transition-colors duration-300">Vision</a>
          </div>
          <Link href="/signup" className="px-6 py-2 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-[var(--cyan)] transition-all duration-300 active:scale-95">
            Start Now
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-8 md:px-20 pt-20">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="flex flex-col gap-4">
            <TextReveal>
              <p className="text-[var(--cyan)] text-[12px] font-black uppercase tracking-[0.4em] mb-4">
                The Financial OS for the Next Gen
              </p>
            </TextReveal>
            <TextReveal delay={200}>
              <h1 className="hero-title font-black text-white">
                TRANSFORM<br />
                <span className="font-light italic text-white/20">WEALTH</span>
              </h1>
            </TextReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-20 items-end">
            <FadeIn className="md:col-span-5">
              <p className="text-lg md:text-2xl text-white/40 leading-tight font-light">
                Finmate is an AI-native financial companion that bridges the gap between raw spending data and intuitive wealth building. Built for students, engineered for excellence.
              </p>
              <div className="flex items-center gap-8 mt-12">
                <a href="#features" className="text-[13px] font-black uppercase tracking-[0.2em] border-b-2 border-[var(--cyan)] pb-1 hover:text-[var(--cyan)] transition-all duration-300">
                  Explore Experience
                </a>
                <Link href="/signup" className="group flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all duration-300">
                  Watch Demo
                  <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[var(--cyan)] transition-colors duration-300">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 1L8 5L3 9V1Z" fill="currentColor" /></svg>
                  </span>
                </Link>
              </div>
            </FadeIn>

            <div className="md:col-span-7 flex justify-end relative">
              <FadeIn delay={200} className="w-full max-w-lg relative z-10">
                <div className="glass-float rounded-3xl p-2 overflow-hidden" style={{ transform: "rotate(3deg)" }}>
                  <div className="bg-[#0A0A0A] rounded-[1.25rem] overflow-hidden">
                    <div className="h-8 bg-white/5 flex items-center px-4 gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-end">
                        <div className="bg-[var(--cyan)]/20 text-[var(--cyan)] px-4 py-2 rounded-2xl rounded-br-none text-xs">
                          Monthly projection?
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white/5 text-white/60 px-4 py-2 rounded-2xl rounded-bl-none text-xs">
                          You&apos;re on track to save Rs. 12,000 this month.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Floating secondary card */}
              <div className="absolute -left-12 -bottom-20 w-64 z-20 hidden lg:block" style={{ transform: "rotate(-5deg)" }}>
              <FadeIn delay={400} className="glass-float rounded-3xl p-6">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Portfolio Growth</p>
                <div className="h-24 flex items-end gap-2">
                  <div className="flex-1 bg-white/5 h-[40%] rounded-t-sm" />
                  <div className="flex-1 bg-white/5 h-[60%] rounded-t-sm" />
                  <div className="flex-1 bg-[var(--cyan)]/40 h-[90%] rounded-t-sm shadow-[0_0_20px_rgba(0,255,255,0.2)]" />
                </div>
              </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ────────────────────────────────── */}
      <div className="py-20 border-y border-white/5 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content text-[8vw] font-black uppercase tracking-tighter text-white/5">
            AUTOMATED WEALTH &bull; INTELLIGENT BUDGETING &bull; AI DRIVEN INSIGHTS &bull; PKR NATIVE &bull; AUTOMATED WEALTH &bull; INTELLIGENT BUDGETING &bull; AI DRIVEN INSIGHTS &bull; PKR NATIVE &bull;&nbsp;
          </div>
        </div>
      </div>

      {/* ── FEATURES (Asymmetric) ──────────────────── */}
      <section id="features" className="section-padding px-8 md:px-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="relative">
              <FadeIn>
                <div className="w-full aspect-[4/5] glass-float rounded-[3rem] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--cyan)]/10 via-transparent to-violet-500/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-6 p-12">
                      <div className="w-20 h-20 mx-auto rounded-full bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                      </div>
                      <p className="text-6xl font-black text-white/10">PKR</p>
                      <p className="text-sm text-white/30">Native Currency Support</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--cyan)]/20 blur-[100px] rounded-full animate-pulse" />
              </FadeIn>
            </div>

            <div className="flex flex-col gap-12">
              <FadeIn>
                <div>
                  <p className="text-[var(--cyan)] text-[11px] font-black uppercase tracking-[0.4em] mb-6">Intelligence Layer</p>
                  <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                    BEYOND THE<br /><span className="text-white/20 font-light">ORDINARY.</span>
                  </h2>
                </div>
              </FadeIn>
              <FadeIn delay={100}>
                <p className="text-xl text-white/30 font-light leading-relaxed max-w-lg">
                  While traditional apps show you where your money went, Finmate predicts where it should go. Our LLM-powered core analyzes patterns in real-time, providing student-specific saving strategies that actually work.
                </p>
              </FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { icon: "lucide:cpu", title: "Predictive AI", desc: "Anticipate upcoming bills before they hit your balance." },
                  { icon: "lucide:zap", title: "Instant Logging", desc: "Voice-to-transaction parsing with 99.8% category accuracy." },
                ].map((f, i) => (
                  <FadeIn key={f.title} delay={200 + i * 80}>
                    <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 group">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--cyan)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--cyan)]/20 transition-colors duration-500">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                          {f.icon === "lucide:cpu" ? <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2" /></> : <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>}
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2 uppercase">{f.title}</h4>
                      <p className="text-sm text-white/20">{f.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOWCASE (Product Mockups) ─────────────── */}
      <section id="showcase" className="py-20 md:py-32 px-8 md:px-20">
        <div className="max-w-[1400px] mx-auto">
          <FadeIn>
            <div className="max-w-lg mb-16 md:mb-24">
              <p className="text-[var(--cyan)] text-[11px] font-black uppercase tracking-[0.4em] mb-6">Product Vision</p>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                EVERY DETAIL.<br /><span className="text-white/20 font-light">CRAFTED.</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <FadeIn className="md:col-span-7">
              <div className="glass-float rounded-3xl p-2 overflow-hidden h-full">
                <div className="bg-[#0A0A0A] rounded-[1.25rem] overflow-hidden h-full">
                  <div className="h-8 bg-white/5 flex items-center px-4 gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <span className="text-[10px] text-white/15 ml-2 font-mono">finmate.app</span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-[var(--cyan)]/10 text-[var(--cyan)]/70 text-xs px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%] leading-relaxed">
                        Spent 450 on lunch and 200 on fuel today
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white/[0.04] text-white/50 text-xs px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[80%] leading-relaxed">
                        <span className="text-[var(--cyan)] font-medium">Recorded.</span> Rs. 450 FOOD + Rs. 200 TRANSIT. Daily spend: Rs. 650 — 38% of budget.
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[var(--cyan)]/10 text-[var(--cyan)]/70 text-xs px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%] leading-relaxed">
                        How much have I spent on food this week?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white/[0.04] text-white/50 text-xs px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[80%] leading-relaxed">
                        This week: <span className="text-white/70 font-medium">Rs. 3,200</span> across 6 transactions. Lunch is your biggest category at 58%.
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <span className="text-xs text-white/15 flex-1">Ask anything about your money...</span>
                      <div className="w-6 h-6 rounded-full bg-[var(--cyan)]/20 flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="var(--cyan)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <div className="md:col-span-5 flex flex-col gap-5">
              <FadeIn delay={100}>
                <div className="glass-float rounded-3xl p-2 overflow-hidden">
                  <div className="bg-[#0A0A0A] rounded-[1.25rem] overflow-hidden p-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/20 mb-4">Monthly Spending</p>
                    <p className="text-2xl font-bold text-white/70 mb-6">Rs. 48,200</p>
                    <div className="flex items-end gap-1.5 h-32">
                      {[35,55,42,70,48,65,38,72,50,60,45,68].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-sm transition-all duration-500"
                            style={{
                              height: `${h}%`,
                              background: i === 11
                                ? "linear-gradient(to top, rgba(0,255,255,0.35), rgba(0,255,255,0.08))"
                                : "rgba(255,255,255,0.06)",
                            }}
                          />
                          <span className="text-[8px] text-white/10">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <div className="glass-float rounded-3xl p-2 overflow-hidden">
                  <div className="bg-[#0A0A0A] rounded-[1.25rem] overflow-hidden p-5 space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/20">Savings Goals</p>
                    {[
                      { name: "MacBook Pro", current: 85000, goal: 180000, color: "rgb(245,158,11)" },
                      { name: "Emergency Fund", current: 32000, goal: 50000, color: "rgb(139,92,246)" },
                      { name: "Textbooks", current: 12000, goal: 15000, color: "rgb(52,211,153)" },
                    ].map((g) => {
                      const pct = Math.round((g.current / g.goal) * 100);
                      return (
                        <div key={g.name}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-white/40">{g.name}</span>
                            <span className="text-[10px] text-white/20">{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: g.color, opacity: 0.6 }} />
                          </div>
                          <p className="text-[9px] text-white/10 mt-1">Rs. {g.current.toLocaleString()} / Rs. {g.goal.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section className="py-20 md:py-32 px-8 md:px-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-24">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                THE BLUEPRINT.
              </h2>
              <p className="text-white/20 uppercase tracking-[0.2em] font-bold">Simple, Fast, Inevitable.</p>
            </div>
          </FadeIn>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 hidden md:block" />

            <div className="space-y-16 md:space-y-32">
              {[
                { num: "01", title: "Connect", desc: "Sync your preferred messaging app. WhatsApp, Telegram, or our native portal. Setup takes 45 seconds." },
                { num: "02", title: "Conversational Logs", desc: "\"Spent 1,200 on grocery\". That's it. No categories to select. No dates to pick. AI handles the taxonomy." },
                { num: "03", title: "Ascend", desc: "Receive weekly intelligence reports that actually mean something. Optimize your habits and grow your wealth." },
              ].map((step, i) => (
                <FadeIn key={step.num} delay={i * 100}>
                  <div className={`relative flex items-center justify-between ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                    <div className={`w-full md:w-[45%] ${i % 2 === 0 ? "md:text-right" : ""}`}>
                      <h3 className="text-2xl font-bold text-[var(--cyan)] mb-4">{step.num}. {step.title}</h3>
                      <p className="text-white/30 leading-relaxed">{step.desc}</p>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white hover:bg-[var(--cyan)] hover:scale-150 transition-all duration-500 hidden md:block" />
                    <div className="w-full md:w-[45%]" />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="relative py-32 md:py-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[var(--cyan)]/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--cyan)]/10 blur-[150px] rounded-full" />
        </div>

        <FadeIn>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-8">
            <h2 className="text-5xl md:text-[90px] leading-[0.9] font-black tracking-tighter mb-12">
              JOIN THE<br /><span className="text-[var(--cyan)]">FINANCIAL</span> ELITE.
            </h2>
            <p className="text-xl text-white/40 mb-16 max-w-xl mx-auto leading-relaxed">
              Experience the future of personal finance today. Free for students. Perpetual intelligence included.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link href="/signup" className="w-full md:w-auto bg-[var(--cyan)] text-black px-12 py-6 rounded-full text-sm font-black uppercase tracking-widest hover:scale-105 transition-transform duration-300 active:scale-95">
                Get Started Now
              </Link>
              <Link href="/login" className="w-full md:w-auto border border-white/20 text-white px-12 py-6 rounded-full text-sm font-black uppercase tracking-widest hover:bg-white/5 transition-colors duration-300">
                Sign In
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="py-20 px-8 md:px-20 border-t border-white/5 bg-black">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-white mb-6 block">
              FIN<span className="text-[var(--cyan)]">MATE</span>
            </Link>
            <p className="text-xs text-white/20 leading-relaxed font-bold uppercase tracking-wider">
              Building the next generation of financial sovereignty tools for the digital-native student.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-24">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black text-[var(--cyan)] uppercase tracking-[0.3em] mb-4">Product</span>
              <Link href="/dashboard" className="text-xs text-white/30 hover:text-white transition-colors duration-300">Dashboard</Link>
              <Link href="/ledger" className="text-xs text-white/30 hover:text-white transition-colors duration-300">Ledger</Link>
              <Link href="/targets" className="text-xs text-white/30 hover:text-white transition-colors duration-300">Targets</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black text-[var(--cyan)] uppercase tracking-[0.3em] mb-4">Account</span>
              <Link href="/login" className="text-xs text-white/30 hover:text-white transition-colors duration-300">Sign In</Link>
              <Link href="/signup" className="text-xs text-white/30 hover:text-white transition-colors duration-300">Sign Up</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black text-[var(--cyan)] uppercase tracking-[0.3em] mb-4">Connect</span>
              <a href="#" className="text-xs text-white/30 hover:text-white transition-colors duration-300">Twitter / X</a>
              <a href="#" className="text-xs text-white/30 hover:text-white transition-colors duration-300">Discord</a>
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-white/10 uppercase font-bold tracking-[0.5em]">&copy; 2026 Finmate AI Labs. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-pulse" />
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">System Status: Optimal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
