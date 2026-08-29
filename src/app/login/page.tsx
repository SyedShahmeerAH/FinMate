"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left — Branding (matches signup style) */}
      <div className="hidden md:flex md:w-[45%] relative overflow-hidden items-center justify-center p-16 bg-gradient-to-br from-[var(--bg)] via-[#080810] to-[#0a0510]">
        {/* Floating blur decorations */}
        <div className="absolute top-1/4 left-12 w-64 h-64 rounded-full bg-[var(--cyan)]/4 blur-[100px]" />
        <div className="absolute bottom-1/4 right-20 w-48 h-48 rounded-full bg-violet-500/5 blur-[80px]" />

        <div className="relative z-10 flex flex-col gap-10 animate-fade-in-up">
          <h1 className="text-[clamp(2rem,4.5vw,4rem)] font-black leading-[0.9] tracking-[-0.03em]">
            <span className="text-transparent" style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.8)" }}>
              MASTER
            </span>
            <br />
            <span className="text-white">YOUR</span>
            <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.8)" }}>
              CAPITAL
            </span>
            <br />
            <span className="bg-gradient-to-r from-[var(--cyan)] to-violet-400 bg-clip-text text-transparent">
              WITH AI.
            </span>
          </h1>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex -space-x-3">
              {["bg-[var(--cyan)]", "bg-violet-400", "bg-emerald-400", "bg-amber-400"].map((bg, i) => (
                <div key={i} className={`w-9 h-9 rounded-full ${bg} border-2 border-[var(--bg)] flex items-center justify-center text-[10px] font-bold text-black`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm text-white/60 font-medium">12,000+ students already here</p>
              <p className="text-[10px] text-white/25 uppercase tracking-wider">Mastering their finances</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login Form (matches signup proportions) */}
      <div className="flex-1 md:w-[55%] flex items-center justify-center p-6 md:p-12 bg-[var(--bg)]">
        <div className="w-full max-w-lg animate-fade-in-up">
          {/* Mobile-only logo */}
          <div className="text-center mb-12 md:hidden">
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">
              FIN<span className="text-[var(--cyan)]">MATE</span>
            </h1>
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Secure Entry</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Welcome back</h2>
            <p className="text-white/40 text-sm mt-2 font-light">Sign in to continue your financial journey.</p>
          </div>

          {/* Form Card — Double Bezel */}
          <div className="doppelrand">
            <div className="doppelrand-inner p-8 md:p-10">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                  <div className="rounded-2xl bg-red-500/5 border border-red-500/10 px-5 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Email</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15">
                      <iconify-icon icon="lucide:mail" class="text-sm" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl pl-11 pr-5 py-3.5 text-white text-sm placeholder:text-white/15 font-light transition-all duration-300 focus:border-[var(--cyan)]/30 focus:shadow-[0_0_20px_rgba(0,255,255,0.06)]"
                      placeholder="you@university.edu"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Password</label>
                    <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--cyan)]/50 hover:text-[var(--cyan)] cursor-pointer transition-colors">
                      Forgot?
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15">
                      <iconify-icon icon="lucide:lock" class="text-sm" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl pl-11 pr-5 py-3.5 text-white text-sm placeholder:text-white/15 font-light transition-all duration-300 focus:border-[var(--cyan)]/30 focus:shadow-[0_0_20px_rgba(0,255,255,0.06)]"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full flex items-center justify-center gap-3 bg-[var(--cyan)] text-black font-medium py-3.5 rounded-full hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all duration-500 ease-[var(--ease-fluid)] active:scale-[0.97] disabled:opacity-40 mt-2"
                >
                  {loading ? "Initializing..." : "INITIALIZE SESSION"}
                  <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <iconify-icon icon="lucide:arrow-right" class="text-xs" />
                  </span>
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
                <p className="text-sm text-white/25">
                  New to the system?{" "}
                  <Link href="/signup" className="text-[var(--cyan)] hover:text-white transition-colors duration-300">
                    Apply for Membership
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-white/15 hover:text-white/40 transition-colors duration-300">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
