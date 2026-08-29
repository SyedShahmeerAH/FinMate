"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
            FIN<span className="text-[var(--cyan)]">MATE</span>
          </h1>
          <div className="eyebrow mx-auto mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
            Create your account
          </div>
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

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3.5 text-white text-sm placeholder:text-white/15 font-light transition-all duration-300"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3.5 text-white text-sm placeholder:text-white/15 font-light transition-all duration-300"
                  placeholder="you@university.edu"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3.5 text-white text-sm placeholder:text-white/15 font-light transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-medium">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3.5 text-white text-sm placeholder:text-white/15 font-light transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 bg-[var(--cyan)] text-black font-medium py-3.5 rounded-full hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all duration-500 ease-[var(--ease-fluid)] active:scale-[0.97] disabled:opacity-40 mt-2"
              >
                {loading ? "Creating account..." : "Create account"}
                <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <iconify-icon icon="lucide:arrow-right" class="text-xs" />
                </span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
              <p className="text-sm text-white/25">
                Already have an account?{" "}
                <Link href="/login" className="text-[var(--cyan)] hover:text-white transition-colors duration-300">
                  Sign in
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
  );
}
