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
    <div className="min-h-screen bg-black bg-grid-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white tracking-tighter mb-2">
            FIN
            <br />
            MATE
          </h1>
          <p className="font-mono text-gray-500 text-sm">SYSTEM.REGISTER</p>
        </div>

        {/* Signup Form */}
        <div className="border-2 border-gray-700 bg-[#0a0a0a] p-8">
          <div className="inline-flex border-2 border-gray-700 px-4 py-2 bg-black mb-8">
            <p className="font-mono text-sm text-[#00FFFF] font-bold">
              {">"} CREATE_ACCOUNT
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="border-2 border-red-500 bg-red-500/10 p-4">
                <p className="font-mono text-sm text-red-500">{error}</p>
              </div>
            )}

            <div>
              <label className="font-mono text-sm text-gray-500 mb-2 block">NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border-2 border-gray-700 p-4 font-mono text-white text-lg focus:border-[#00FFFF] outline-none transition-colors"
                placeholder="YOUR_NAME"
                required
              />
            </div>

            <div>
              <label className="font-mono text-sm text-gray-500 mb-2 block">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border-2 border-gray-700 p-4 font-mono text-white text-lg focus:border-[#00FFFF] outline-none transition-colors"
                placeholder="USER@EMAIL.COM"
                required
              />
            </div>

            <div>
              <label className="font-mono text-sm text-gray-500 mb-2 block">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border-2 border-gray-700 p-4 font-mono text-white text-lg focus:border-[#00FFFF] outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="font-mono text-sm text-gray-500 mb-2 block">CONFIRM_PASSWORD</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black border-2 border-gray-700 p-4 font-mono text-white text-lg focus:border-[#00FFFF] outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FFFF] text-black font-bold text-xl py-4 hover:bg-white transition-colors border-2 border-[#00FFFF] hover:border-white disabled:opacity-50 disabled:hover:bg-[#00FFFF]"
            >
              {loading ? "CREATING_ACCOUNT..." : "REGISTER"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="font-mono text-sm text-gray-500">
              HAVE_ACCOUNT?{" "}
              <Link href="/login" className="text-[#00FFFF] hover:text-white transition-colors">
                LOGIN
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="font-mono text-sm text-gray-600 hover:text-gray-400 transition-colors">
            ← BACK_TO_SYSTEM
          </Link>
        </div>
      </div>
    </div>
  );
}
