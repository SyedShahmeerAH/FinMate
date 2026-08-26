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
    const colors = ["bg-[#00FFFF]", "bg-white", "bg-gray-500", "bg-gray-400", "bg-gray-300"];
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
        <main className="flex-1 h-screen overflow-y-auto bg-black p-4 md:p-16 pt-20 md:pt-16 bg-grid-pattern">
          <div className="max-w-6xl mx-auto flex items-center justify-center h-full">
            <p className="font-mono text-xl text-gray-500 animate-pulse">LOADING TARGETS...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Sidebar activeNav="targets" />
        <main className="flex-1 h-screen overflow-y-auto bg-black p-4 md:p-16 pt-20 md:pt-16 bg-grid-pattern">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-full gap-4">
            <p className="font-mono text-xl text-gray-500">LOGIN TO VIEW TARGETS</p>
            <a href="/login" className="font-mono text-[#00FFFF] hover:text-white transition-colors">LOGIN →</a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar activeNav="targets" />
      <main className="flex-1 h-screen overflow-y-auto bg-black p-4 md:p-16 pt-20 md:pt-16 bg-grid-pattern relative scroll-smooth">
        <div className="max-w-6xl mx-auto flex flex-col gap-16 pb-20">
          <section className="flex flex-col gap-8">
            <div className="inline-flex border-2 border-gray-700 px-4 py-2 bg-[#0a0a0a]">
              <p className="font-mono text-sm md:text-base text-[#00FFFF] font-bold">
                {">"} MODULE: TARGETS // {user?.name.toUpperCase() || "GUEST"}
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight leading-[1.1]">
              Targets
              <br />
              <span className="text-gray-500">Track your financial goals.</span>
            </h1>
          </section>

          <div className="flex justify-between items-center">
            <p className="font-mono text-gray-500">{targets.length} GOALS</p>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="bg-[#00FFFF] text-black px-6 py-3 font-bold text-sm hover:bg-white transition-colors border-2 border-[#00FFFF]"
            >
              {showAdd ? "CANCEL" : "+ ADD_TARGET"}
            </button>
          </div>

          {showAdd && (
            <div className="border-2 border-gray-700 p-6 bg-[#0a0a0a] flex flex-wrap gap-4">
              <input type="text" placeholder="GOAL NAME" value={newTarget.name}
                onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                className="flex-1 min-w-[200px] bg-black border-2 border-gray-700 p-3 font-mono text-white text-sm focus:border-[#00FFFF] outline-none" />
              <input type="number" placeholder="CURRENT AMOUNT" value={newTarget.current}
                onChange={(e) => setNewTarget({ ...newTarget, current: e.target.value })}
                className="w-40 bg-black border-2 border-gray-700 p-3 font-mono text-white text-sm focus:border-[#00FFFF] outline-none" />
              <input type="number" placeholder="GOAL AMOUNT" value={newTarget.goal}
                onChange={(e) => setNewTarget({ ...newTarget, goal: e.target.value })}
                className="w-40 bg-black border-2 border-gray-700 p-3 font-mono text-white text-sm focus:border-[#00FFFF] outline-none" />
              <button onClick={addTarget}
                className="bg-[#00FFFF] text-black px-6 py-3 font-bold text-sm hover:bg-white transition-colors border-2 border-[#00FFFF]">
                SAVE
              </button>
            </div>
          )}

          <div className="flex flex-col gap-8">
            {targets.length > 0 ? (
              targets.map((target) => {
                const pct = Math.round((target.current / target.goal) * 100);
                return (
                  <div key={target._id} className="border-2 border-gray-700 p-8 bg-[#0a0a0a] group">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="font-mono text-sm text-gray-500 mb-2">{target.name}</p>
                        {editingId === target._id ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-lg text-white">Rs.</span>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-32 bg-black border-2 border-[#00FFFF] p-2 font-mono text-white text-xl focus:outline-none"
                              autoFocus
                            />
                            <button onClick={() => updateTargetAmount(target._id)}
                              className="bg-[#00FFFF] text-black px-3 py-1 font-bold text-xs">SAVE</button>
                            <button onClick={() => { setEditingId(null); setEditAmount(""); }}
                              className="text-gray-500 hover:text-white text-xs font-mono">CANCEL</button>
                          </div>
                        ) : (
                          <p className="font-mono text-3xl font-bold text-white cursor-pointer hover:text-[#00FFFF] transition-colors"
                            onClick={() => { setEditingId(target._id); setEditAmount(String(target.current)); }}>
                            Rs. {target.current.toLocaleString()} / Rs. {target.goal.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-4xl font-black text-[#00FFFF] hover-glitch">{pct}%</span>
                        <button onClick={() => deleteTarget(target._id)}
                          className="text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <iconify-icon icon="lucide:trash-2" class="text-xl" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-gray-800 border border-gray-700">
                      <div className={`h-full ${target.color} transition-all duration-500`}
                        style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <p className="font-mono text-sm text-gray-500 mt-4">
                      Rs. {(target.goal - target.current).toLocaleString()} REMAINING
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="border-2 border-dashed border-gray-700 p-12 text-center">
                <iconify-icon icon="lucide:target" class="text-6xl text-gray-700 mb-4" />
                <p className="font-mono text-xl text-gray-500">NO_TARGETS</p>
                <p className="font-mono text-sm text-gray-700 mt-2">Click + ADD_TARGET to set your first goal</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
