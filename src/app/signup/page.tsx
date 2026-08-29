"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  return score;
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const strength = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400", "bg-[var(--cyan)]"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("You must agree to the terms");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left — Branding */}
      <div className="hidden md:flex md:w-[45%] relative overflow-hidden items-center justify-center p-16 bg-gradient-to-br from-[var(--bg)] via-[#080810] to-[#0a0510]">
        {/* Floating blur decorations */}
        <div className="absolute top-1/4 left-12 w-64 h-64 rounded-full bg-[var(--cyan)]/4 blur-[100px]" />
        <div className="absolute bottom-1/4 right-20 w-48 h-48 rounded-full bg-violet-500/5 blur-[80px]" />

        <div className="relative z-10 flex flex-col gap-10 animate-fade-in-up">
          <h1 className="text-[clamp(2rem,4.5vw,4rem)] font-black leading-[0.9] tracking-[-0.03em]">
            <span className="text-transparent" style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.8)" }}>
              FUTURE
            </span>
            <br />
            <span className="text-white">FINANCE</span>
            <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.8)" }}>
              STARTS
            </span>
            <br />
            <span className="bg-gradient-to-r from-[var(--cyan)] to-violet-400 bg-clip-text text-transparent">
              NOW.
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
              <p className="text-sm text-white/60 font-medium">Join 12,000+ university students</p>
              <p className="text-[10px] text-white/25 uppercase tracking-wider">Already mastering their finances</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Signup Form */}
      <div className="flex-1 md:w-[55%] flex items-center justify-center p-6 md:p-12 bg-[var(--bg)]">
        <div className="w-full max-w-lg animate-fade-in-up">
          {/* Mobile-only logo */}
          <div className="text-center mb-12 md:hidden">
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">
              FIN<span className="text-[var(--cyan)]">MATE</span>
            </h1>
          </div>

          <div className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-3">Create your account</p>
            <h2 className="text-3xl font-black text-white tracking-tight">Start your journey</h2>
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

                {/* Name + Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Name</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15">
                        <iconify-icon icon="lucide:user" class="text-sm" />
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl pl-11 pr-5 py-3.5 text-white text-sm placeholder:text-white/15 font-light transition-all duration-300 focus:border-[var(--cyan)]/30 focus:shadow-[0_0_20px_rgba(0,255,255,0.06)]"
                        placeholder="Your name"
                        required
                      />
                    </div>
                  </div>
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
                </div>

                {/* Password with strength indicator */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Password</label>
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
                  {password.length > 0 && (
                    <div className="flex items-center gap-3 mt-1 animate-fade-in-up">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength ? strengthColors[strength] : "bg-white/[0.03]"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider ${
                        strength <= 1 ? "text-red-400/60" : strength <= 2 ? "text-amber-400/60" : "text-[var(--cyan)]"
                      }`}>
                        {strengthLabels[strength]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15">
                      <iconify-icon icon="lucide:lock" class="text-sm" />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl pl-11 pr-5 py-3.5 text-white text-sm placeholder:text-white/15 font-light transition-all duration-300 focus:border-[var(--cyan)]/30 focus:shadow-[0_0_20px_rgba(0,255,255,0.06)]"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded border border-white/10 bg-white/[0.02] peer-checked:bg-[var(--cyan)] peer-checked:border-[var(--cyan)] transition-all duration-300 flex items-center justify-center">
                      {agreed && <iconify-icon icon="lucide:check" class="text-[10px] text-black" />}
                    </div>
                  </div>
                  <span className="text-xs text-white/30 leading-relaxed">
                    I agree to the terms of service and privacy policy
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full flex items-center justify-center gap-3 bg-[var(--cyan)] text-black font-medium py-3.5 rounded-full hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all duration-500 ease-[var(--ease-fluid)] active:scale-[0.97] disabled:opacity-40 mt-2"
                >
                  {loading ? "Creating account..." : "Complete Registration"}
                  <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <iconify-icon icon="lucide:arrow-right" class="text-xs" />
                  </span>
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
                <p className="text-sm text-white/25">
                  Already part of the future?{" "}
                  <Link href="/login" className="text-[var(--cyan)] hover:text-white transition-colors duration-300">
                    Sign in here
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
