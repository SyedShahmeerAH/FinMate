"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface Target {
  _id: string;
  name: string;
  current: number;
  goal: number;
  color: string;
}

export default function TargetsPage() {
  const { user, loading: authLoading } = useAuth();
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTarget, setNewTarget] = useState({ name: "", current: "", goal: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  useEffect(() => {
    if (user) fetchTargets();
  }, [user]);

  const fetchTargets = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/user/targets", { headers: { Authorization: "Bearer " + token } });
      if (res.ok) {
        const data = await res.json();
        setTargets(data.targets || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const addTarget = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newTarget.name || !newTarget.goal) return;
    const colors = ["bg-[var(--cyan)]", "bg-violet-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400"];
    await fetch("/api/user/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        name: newTarget.name,
        current: Number(newTarget.current) || 0,
        goal: Number(newTarget.goal),
        color: colors[targets.length % colors.length],
      }),
    });
    setNewTarget({ name: "", current: "", goal: "" });
    setShowAdd(false);
    fetchTargets();
  };

  const updateTargetAmount = async (targetId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !editAmount) return;
    await fetch("/api/user/targets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ targetId, updates: { current: Number(editAmount) } }),
    });
    setEditingId(null);
    setEditAmount("");
    fetchTargets();
  };

  const deleteTarget = async (targetId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch("/api/user/targets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ targetId }),
    });
    fetchTargets();
  };

  if (authLoading || loading) {
    return (
      <>
        <Sidebar activeNav="targets" />
        <main className="md:ml-[296px] min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--cyan)]/30 border-t-[var(--cyan)] animate-spin mx-auto" />
            <p className="text-sm text-white/20">Loading targets...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Sidebar activeNav="targets" />
        <main className="md:ml-[296px] min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-4 animate-fade-in-up">
            <p className="text-lg text-white/30">Sign in to view targets</p>
            <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-[var(--cyan)] text-sm hover:bg-white/[0.1] transition-all duration-300">
              Sign in
              <iconify-icon icon="lucide:arrow-right" class="text-xs" />
            </a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar activeNav="targets" />
      <main className="md:ml-[296px] min-h-screen p-6 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-20">

          {/* Header */}
          <section className="flex flex-col gap-6 animate-fade-in-up">
            <div className="eyebrow">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
              Targets — {user.name}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05]">
              Goals
            </h1>
          </section>

          {/* Add Target Button */}
          <div className="flex justify-between items-center animate-fade-in-up delay-100">
            <p className="text-xs uppercase tracking-[0.15em] text-white/30">{targets.length} goals</p>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="group flex items-center gap-2 bg-[var(--cyan)] text-black px-5 py-2.5 rounded-full text-sm font-medium hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all duration-500 ease-[var(--ease-fluid)] active:scale-[0.97]"
            >
              {showAdd ? "Cancel" : "+ Add Target"}
            </button>
          </div>

          {/* Add Form */}
          {showAdd && (
            <div className="doppelrand animate-fade-in-up">
              <div className="doppelrand-inner p-6 md:p-8">
                <div className="flex flex-wrap gap-3">
                  <input type="text" placeholder="Goal name" value={newTarget.name}
                    onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                    className="flex-1 min-w-[200px] bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3 text-white text-sm placeholder:text-white/15 font-light" />
                  <input type="number" placeholder="Current" value={newTarget.current}
                    onChange={(e) => setNewTarget({ ...newTarget, current: e.target.value })}
                    className="w-32 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3 text-white text-sm placeholder:text-white/15 font-light" />
                  <input type="number" placeholder="Goal" value={newTarget.goal}
                    onChange={(e) => setNewTarget({ ...newTarget, goal: e.target.value })}
                    className="w-32 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3 text-white text-sm placeholder:text-white/15 font-light" />
                  <button onClick={addTarget}
                    className="bg-[var(--cyan)] text-black px-6 py-3 rounded-full font-medium text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all duration-500 active:scale-[0.97]">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Target Cards */}
          <div className="flex flex-col gap-4">
            {targets.length > 0 ? (
              targets.map((target, i) => {
                const pct = Math.round((target.current / target.goal) * 100);
                return (
                  <div
                    key={target._id}
                    className="doppelrand group animate-fade-in-up"
                    style={{ animationDelay: `${150 + i * 75}ms` }}
                  >
                    <div className="doppelrand-inner p-6 md:p-8">
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-2">{target.name}</p>
                          {editingId === target._id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white/40">Rs.</span>
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-32 bg-white/[0.02] border border-[var(--cyan)]/30 rounded-xl px-4 py-2 text-white text-lg focus:outline-none"
                                autoFocus
                              />
                              <button onClick={() => updateTargetAmount(target._id)}
                                className="bg-[var(--cyan)] text-black px-4 py-1.5 rounded-full text-xs font-medium">Save</button>
                              <button onClick={() => { setEditingId(null); setEditAmount(""); }}
                                className="text-white/20 hover:text-white/40 text-xs transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <p
                              className="text-xl md:text-2xl font-bold text-white cursor-pointer hover:text-[var(--cyan)] transition-colors duration-300"
                              onClick={() => { setEditingId(target._id); setEditAmount(String(target.current)); }}
                            >
                              Rs. {target.current.toLocaleString()} / Rs. {target.goal.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-[var(--cyan)]">{pct}%</span>
                          <button onClick={() => deleteTarget(target._id)}
                            className="text-white/10 hover:text-red-400 transition-colors duration-300 opacity-0 group-hover:opacity-100 p-1">
                            <iconify-icon icon="lucide:trash-2" class="text-sm" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${target.color} transition-all duration-700 ease-[var(--ease-fluid)] progress-glow`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>

                      <p className="text-xs text-white/20 mt-3">
                        Rs. {(target.goal - target.current).toLocaleString()} remaining
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="doppelrand animate-fade-in-up delay-150">
                <div className="doppelrand-inner p-12 text-center">
                  <iconify-icon icon="lucide:target" class="text-4xl text-white/10 mb-4" />
                  <p className="text-white/20 text-lg">No targets yet</p>
                  <p className="text-white/10 text-sm mt-2">Set your first financial goal</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
