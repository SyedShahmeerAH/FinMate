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

const goalIcons = ["lucide:home", "lucide:graduation-cap", "lucide:car", "lucide:plane", "lucide:laptop", "lucide:heart"];
const goalColors = [
  { bg: "bg-[var(--cyan)]/10", border: "border-[var(--cyan)]/20", text: "text-[var(--cyan)]", bar: "bg-[var(--cyan)]", glow: "shadow-[0_0_15px_rgba(0,255,255,0.3)]" },
  { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", bar: "bg-violet-400", glow: "shadow-[0_0_15px_rgba(167,139,250,0.3)]" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", bar: "bg-emerald-400", glow: "shadow-[0_0_15px_rgba(52,211,153,0.3)]" },
  { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", bar: "bg-amber-400", glow: "shadow-[0_0_15px_rgba(251,191,36,0.3)]" },
  { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", bar: "bg-rose-400", glow: "shadow-[0_0_15px_rgba(251,113,133,0.3)]" },
];

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
    await fetch("/api/user/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        name: newTarget.name,
        current: Number(newTarget.current) || 0,
        goal: Number(newTarget.goal),
        color: goalColors[targets.length % goalColors.length].bar,
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

  const primary = targets.length > 0 ? targets[0] : null;
  const rest = targets.slice(1);

  const getCompletionDate = (t: Target) => {
    if (t.current >= t.goal) return "Complete";
    const pct = t.current / t.goal;
    const monthsLeft = Math.ceil((1 - pct) * 12);
    const d = new Date();
    d.setMonth(d.getMonth() + monthsLeft);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <>
      <Sidebar activeNav="targets" />
      <main className="md:ml-[296px] min-h-screen p-8 lg:p-20 relative">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <section className="mb-32 animate-fade-in-up">
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--cyan)]/5 border border-[var(--cyan)]/20 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cyan)]">
                  <span className="w-1 h-1 rounded-full bg-[var(--cyan)] animate-pulse" />
                  Active Ambitions
                </div>
                <h2 className="text-7xl lg:text-9xl font-bold tracking-tighter text-white leading-none">
                  Financial<br />
                  <span className="text-white/20">Destinations</span>
                </h2>
              </div>
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="group relative p-6 rounded-full doppelrand hover:scale-110 transition-transform duration-500"
              >
                <div className="doppelrand-inner w-full h-full rounded-full flex items-center justify-center">
                  <iconify-icon icon={showAdd ? "lucide:x" : "lucide:plus"} class="text-3xl text-[var(--cyan)] group-hover:rotate-90 transition-transform duration-500" />
                </div>
                <div className="absolute -inset-1 rounded-full bg-[var(--cyan)]/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>
          </section>

          {/* Add Goal Form (floating) */}
          {showAdd && (
            <div className="fixed bottom-12 right-12 z-50 animate-fade-in-up">
              <div className="doppelrand">
                <div className="doppelrand-inner p-8 w-[400px]">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="text-xl font-bold">New Target</h4>
                    <button onClick={() => setShowAdd(false)} className="text-white/20 hover:text-white transition-colors">
                      <iconify-icon icon="lucide:x" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono">Goal Title</label>
                      <input type="text" placeholder="e.g. World Tour 2026" value={newTarget.name}
                        onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-white text-sm focus:border-[var(--cyan)]/50 focus:outline-none transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono">Target Amount</label>
                        <input type="number" placeholder="0.00" value={newTarget.goal}
                          onChange={(e) => setNewTarget({ ...newTarget, goal: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-white text-sm focus:border-[var(--cyan)]/50 focus:outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono">Initial Deposit</label>
                        <input type="number" placeholder="0.00" value={newTarget.current}
                          onChange={(e) => setNewTarget({ ...newTarget, current: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-white text-sm focus:border-[var(--cyan)]/50 focus:outline-none transition-colors" />
                      </div>
                    </div>
                    <button onClick={addTarget}
                      className="w-full py-5 rounded-2xl bg-[var(--cyan)] text-black font-bold text-sm tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                      Initialize Goal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Goals */}
          <section className="space-y-24 pb-40">

            {/* Primary Goal — Asymmetric Large */}
            {primary && (() => {
              const pct = Math.round((primary.current / primary.goal) * 100);
              const idx = targets.indexOf(primary);
              const gc = goalColors[idx % goalColors.length];
              return (
                <div className="grid grid-cols-12 gap-12 items-center animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                  <div className="col-span-12 lg:col-span-8">
                    <div className="doppelrand group">
                      <div className="doppelrand-inner p-10 lg:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 font-mono text-white/5 text-[10rem] font-black leading-none pointer-events-none">
                          01
                        </div>
                        <div className="relative z-10">
                          <header className="flex justify-between items-start mb-20">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3 font-mono">Goal {idx + 1}</p>
                              {editingId === primary._id ? (
                                <div className="flex items-center gap-2">
                                  <input type="text" value={newTarget.name || primary.name} readOnly
                                    className="text-5xl lg:text-6xl font-bold text-white tracking-tighter bg-transparent border-b border-white/10 outline-none" />
                                </div>
                              ) : (
                                <h3 className="text-5xl lg:text-6xl font-bold text-white tracking-tighter">{primary.name}</h3>
                              )}
                            </div>
                            <div className="text-right">
                              {editingId === primary._id ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-4xl font-bold text-white tracking-tighter">Rs.</span>
                                  <input type="number" value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="w-40 bg-transparent border-b border-[var(--cyan)]/50 text-4xl font-bold text-white tracking-tighter outline-none text-right"
                                    autoFocus />
                                </div>
                              ) : (
                                <p className="text-4xl font-bold text-white tracking-tighter cursor-pointer hover:text-[var(--cyan)] transition-colors"
                                  onClick={() => { setEditingId(primary._id); setEditAmount(String(primary.current)); }}>
                                  Rs. {primary.current.toLocaleString()}
                                </p>
                              )}
                              <p className="text-sm text-white/30 font-mono">OF Rs. {primary.goal.toLocaleString()}</p>
                            </div>
                          </header>

                          <div className="relative mb-12">
                            <div className="flex items-baseline gap-4 mb-6">
                              <span className="text-[clamp(8rem,15vw,12rem)] font-black text-[var(--cyan)] drop-shadow-[0_0_30px_rgba(0,255,255,0.3)] leading-none tracking-tighter">
                                {pct}
                              </span>
                              <span className="text-6xl font-light text-white/20">%</span>
                            </div>
                            <div className="w-full h-4 bg-white/[0.03] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000 ease-[var(--ease-fluid)]"
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  background: "linear-gradient(90deg, var(--cyan), rgba(0,255,255,0.6))",
                                  boxShadow: "0 0 30px rgba(0,255,255,0.25), 0 0 10px rgba(0,255,255,0.1)",
                                }} />
                            </div>
                          </div>

                          <footer className="flex justify-between items-center pt-8 border-t border-white/[0.05]">
                            <p className="text-sm text-white/40">
                              {pct >= 100 ? (
                                <span className="text-[var(--cyan)] font-medium">Goal Complete!</span>
                              ) : (
                                <>Estimated completion: <span className="text-white font-medium">{getCompletionDate(primary)}</span></>
                              )}
                            </p>
                            <div className="flex gap-3">
                              <button onClick={() => deleteTarget(primary._id)}
                                className="px-6 py-2 rounded-full border border-white/10 hover:border-red-400/50 hover:text-red-400 text-xs transition-colors">
                                Remove
                              </button>
                              {editingId === primary._id ? (
                                <>
                                  <button onClick={() => updateTargetAmount(primary._id)}
                                    className="px-6 py-2 rounded-full bg-[var(--cyan)] text-black text-xs font-bold">
                                    Save
                                  </button>
                                  <button onClick={() => { setEditingId(null); setEditAmount(""); }}
                                    className="px-6 py-2 rounded-full border border-white/10 text-xs transition-colors">
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button onClick={() => { setEditingId(primary._id); setEditAmount(String(primary.current)); }}
                                  className="px-6 py-2 rounded-full bg-[var(--cyan)] text-black text-xs font-bold">
                                  Add Funds
                                </button>
                              )}
                            </div>
                          </footer>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-4 space-y-8 lg:translate-y-12">
                    <div className="doppelrand p-8">
                      <div className="doppelrand-inner">
                        <iconify-icon icon="lucide:trending-up" class="text-4xl text-[var(--cyan)] mb-6" />
                        <h4 className="text-xl font-bold mb-2">Progress Insight</h4>
                        <p className="text-sm text-white/40 leading-relaxed">
                          {pct >= 50
                            ? `You're over halfway there. Just Rs. ${(primary.goal - primary.current).toLocaleString()} to go.`
                            : pct >= 25
                              ? `Solid progress at ${pct}%. Keep the momentum going.`
                              : `Every journey starts somewhere. You've saved Rs. ${primary.current.toLocaleString()} so far.`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="p-8 rounded-[2.5rem] border border-white/[0.05] bg-white/[0.01]">
                      <p className="text-[10px] uppercase tracking-widest text-white/20 mb-4">Milestone Tracker</p>
                      <div className="space-y-4">
                        {[
                          { mark: 25, label: "First 25% reached" },
                          { mark: 50, label: "Halfway milestone" },
                          { mark: 75, label: "Three quarters done" },
                          { mark: 100, label: "Goal complete" },
                        ].map((m) => (
                          <div key={m.mark} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                              pct >= m.mark
                                ? "bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)]"
                                : "bg-white/20"
                            }`} />
                            <span className={`text-xs ${pct >= m.mark ? "text-white" : "text-white/40"}`}>{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Secondary Goals Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                {rest.map((target, i) => {
                  const pct = Math.round((target.current / target.goal) * 100);
                  const idx = targets.indexOf(target);
                  const gc = goalColors[idx % goalColors.length];
                  const icon = goalIcons[idx % goalIcons.length];
                  return (
                    <div key={target._id}
                      className="doppelrand group hover:-translate-y-2 transition-transform duration-500">
                      <div className="doppelrand-inner p-10">
                        <div className="flex justify-between items-start mb-16">
                          <div className={`w-14 h-14 rounded-2xl ${gc.bg} border ${gc.border} flex items-center justify-center ${gc.text} text-2xl`}>
                            <iconify-icon icon={icon} />
                          </div>
                          <div className="text-right">
                            {editingId === target._id ? (
                              <div className="flex items-center gap-1">
                                <input type="number" value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  className="w-20 bg-transparent border-b border-[var(--cyan)]/50 text-2xl font-bold text-white outline-none text-right"
                                  autoFocus />
                              </div>
                            ) : (
                              <p className={`text-2xl font-bold ${pct >= 50 ? "text-white" : "text-white/20"}`}>{pct}%</p>
                            )}
                            <p className="text-[10px] font-mono text-white/20 uppercase tracking-tighter">
                              {pct >= 75 ? "Almost There" : pct >= 50 ? "Halfway" : pct >= 25 ? "Growing" : "Early Stage"}
                            </p>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{target.name}</h3>
                        <p className="text-sm text-white/30 mb-8">Rs. {target.goal.toLocaleString()} target</p>

                        <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden mb-6">
                          <div className={`h-full ${gc.bar} ${gc.glow} transition-all duration-1000`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-white/20 uppercase mb-1 font-mono">Remaining</p>
                            <p className="text-lg font-bold">Rs. {(target.goal - target.current).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingId(target._id); setEditAmount(String(target.current)); }}
                              className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-[var(--cyan)] hover:text-black transition-all">
                              <iconify-icon icon="lucide:plus" />
                            </button>
                            <button onClick={() => deleteTarget(target._id)}
                              className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
                              <iconify-icon icon="lucide:trash-2" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add New Goal Card */}
                <button onClick={() => setShowAdd(true)}
                  className="group p-10 rounded-[2.5rem] border-2 border-dashed border-white/5 hover:border-[var(--cyan)]/20 transition-all duration-500 flex flex-col items-center justify-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:bg-[var(--cyan)]/5 group-hover:border-[var(--cyan)]/20 transition-all">
                    <iconify-icon icon="lucide:plus" class="text-3xl text-white/10 group-hover:text-[var(--cyan)] transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 group-hover:text-white transition-colors">Define a New Goal</p>
                    <p className="text-[10px] font-mono text-white/10 uppercase tracking-widest mt-2">Limitless Ambition</p>
                  </div>
                </button>
              </div>
            )}

            {/* Empty State */}
            {targets.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <div className="doppelrand p-10 text-center">
                  <div className="doppelrand-inner">
                    <iconify-icon icon="lucide:target" class="text-4xl text-white/10 mb-4" />
                    <p className="text-white/20 text-lg">No targets yet</p>
                    <p className="text-white/10 text-sm mt-2">Set your first financial goal</p>
                  </div>
                </div>
                <button onClick={() => setShowAdd(true)}
                  className="group p-10 rounded-[2.5rem] border-2 border-dashed border-white/5 hover:border-[var(--cyan)]/20 transition-all duration-500 flex flex-col items-center justify-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:bg-[var(--cyan)]/5 group-hover:border-[var(--cyan)]/20 transition-all">
                    <iconify-icon icon="lucide:plus" class="text-3xl text-white/10 group-hover:text-[var(--cyan)] transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 group-hover:text-white transition-colors">Define a New Goal</p>
                    <p className="text-[10px] font-mono text-white/10 uppercase tracking-widest mt-2">Limitless Ambition</p>
                  </div>
                </button>
              </div>
            )}

          </section>
        </div>
      </main>
    </>
  );
}
