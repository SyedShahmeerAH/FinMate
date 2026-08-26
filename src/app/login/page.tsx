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
    <div className="min-h-screen bg-black bg-grid-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white tracking-tighter mb-2">
            FIN
            <br />
            MATE
          </h1>
          <p className="font-mono text-gray-500 text-sm">SYSTEM.LOGIN</p>
        </div>

        {/* Login Form */}
        <div className="border-2 border-gray-700 bg-[#0a0a0a] p-8">
          <div className="inline-flex border-2 border-gray-700 px-4 py-2 bg-black mb-8">
            <p className="font-mono text-sm text-[#00FFFF] font-bold">
              {">"} AUTHENTICATE
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="border-2 border-red-500 bg-red-500/10 p-4">
                <p className="font-mono text-sm text-red-500">{error}</p>
              </div>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FFFF] text-black font-bold text-xl py-4 hover:bg-white transition-colors border-2 border-[#00FFFF] hover:border-white disabled:opacity-50 disabled:hover:bg-[#00FFFF]"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="font-mono text-sm text-gray-500">
              NO_ACCOUNT?{" "}
              <Link href="/signup" className="text-[#00FFFF] hover:text-white transition-colors">
                REGISTER
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
