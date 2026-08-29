"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import DonutChart from "@/components/DonutChart";
import SpendingAreaChart from "@/components/SpendingAreaChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";

interface Transaction {
  _id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface UserData {
  summary: {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
    categoryTotals: Record<string, number>;
    targets: { name: string; progress: number; remaining: number }[];
  };
  transactions: Transaction[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTx, setShowAddTx] = useState(false);
  const [newTx, setNewTx] = useState({ description: "", category: "FOOD", amount: "" });

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      window.addEventListener("focus", fetchData);
      return () => {
        clearInterval(interval);
        window.removeEventListener("focus", fetchData);
      };
    }
  }, [user]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/user/data", { headers: { Authorization: "Bearer " + token } });
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const addTransaction = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newTx.description || !newTx.amount) return;
    try {
      await fetch("/api/user/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          description: newTx.description.toUpperCase(),
          category: newTx.category,
          amount: -Math.abs(Number(newTx.amount)),
        }),
      });
      setNewTx({ description: "", category: "FOOD", amount: "" });
      setShowAddTx(false);
      fetchData();
    } catch { /* silent */ }
  };

  if (authLoading || loading) {
    return (
      <>
        <Sidebar activeNav="dashboard" />
        <main className="md:ml-[296px] min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--cyan)]/30 border-t-[var(--cyan)] animate-spin mx-auto" />
            <p className="text-sm text-white/20">Loading dashboard...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Sidebar activeNav="dashboard" />
        <main className="md:ml-[296px] min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-4 animate-fade-in-up">
            <p className="text-lg text-white/30">Sign in to view dashboard</p>
            <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-[var(--cyan)] text-sm hover:bg-white/[0.1] transition-all duration-300">
              Sign in
              <iconify-icon icon="lucide:arrow-right" class="text-xs" />
            </a>
          </div>
        </main>
      </>
    );
  }

  const s = data?.summary;
  const burnRate = s ? Math.round(s.totalExpenses / Math.max(1, new Date().getDate())) : 0;

  return (
    <>
      <Sidebar activeNav="dashboard" />
      <main className="md:ml-[296px] min-h-screen p-6 md:p-12 lg:p-16">
        <div className="max-w-7xl mx-auto flex flex-col gap-16 pb-20">

          {/* Header */}
          <section className="flex flex-col gap-6 animate-fade-in-up">
            <div className="eyebrow">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
              Dashboard — {user.name}
            </div>
            <h1 className="text-[clamp(3.5rem,8vw,6rem)] font-black text-white tracking-[-0.04em] leading-[0.9]">
              OVERVIEW.
            </h1>
          </section>

          {/* Bento Grid — Stats Row 1: Balance 8col / Burn Rate 4col */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Balance — 8 cols */}
            <div
              className="md:col-span-8 doppelrand animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="doppelrand-inner p-8 md:p-10 flex flex-col justify-between h-full min-h-[220px]">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/30">Balance</p>
                  <div className="w-10 h-10 rounded-full bg-[var(--cyan)]/5 border border-[var(--cyan)]/10 flex items-center justify-center">
                    <iconify-icon icon="lucide:wallet" class="text-[var(--cyan)]" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-2">Total Capital</p>
                  <h3 className="text-[clamp(2.5rem,6vw,5rem)] font-black text-white tracking-tight leading-none">
                    Rs. {(s?.balance || 0).toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>

            {/* Burn Rate — 4 cols */}
            <div
              className="md:col-span-4 doppelrand animate-fade-in-up"
              style={{ animationDelay: "175ms" }}
            >
              <div className="doppelrand-inner p-8 flex flex-col justify-between h-full min-h-[220px]">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/30">Burn Rate</p>
                  <div className="w-10 h-10 rounded-full bg-red-400/5 border border-red-400/10 flex items-center justify-center">
                    <iconify-icon icon="lucide:flame" class="text-red-400/60" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-2">Daily Average</p>
                  <h3 className="text-[clamp(2rem,5vw,4rem)] font-black text-red-400/70 tracking-tight leading-none">
                    Rs. {burnRate.toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid — Stats Row 2: Income 4col / Expenses 8col */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Income — 4 cols */}
            <div
              className="md:col-span-4 doppelrand animate-fade-in-up"
              style={{ animationDelay: "250ms" }}
            >
              <div className="doppelrand-inner p-8 flex flex-col justify-between h-full min-h-[180px]">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/30">Income</p>
                  <div className="w-10 h-10 rounded-full bg-[var(--cyan)]/5 border border-[var(--cyan)]/10 flex items-center justify-center">
                    <iconify-icon icon="lucide:trending-up" class="text-[var(--cyan)]" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-[var(--cyan)] tracking-tight">
                  Rs. {(s?.totalIncome || 0).toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Expenses — 8 cols */}
            <div
              className="md:col-span-8 doppelrand animate-fade-in-up"
              style={{ animationDelay: "325ms" }}
            >
              <div className="doppelrand-inner p-8 flex flex-col justify-between h-full min-h-[180px]">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/30">Expenses</p>
                  <div className="w-10 h-10 rounded-full bg-red-400/5 border border-red-400/10 flex items-center justify-center">
                    <iconify-icon icon="lucide:credit-card" class="text-red-400/60" />
                  </div>
                </div>
                <h3 className="text-4xl font-black text-white/80 tracking-tight">
                  Rs. {(s?.totalExpenses || 0).toLocaleString()}
                </h3>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider text-white/20 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.04]">
                    {s?.transactionCount || 0} transactions
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Add */}
          <div className="doppelrand animate-fade-in-up delay-300">
            <div className="doppelrand-inner p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30">Quick Add</p>
                <button
                  onClick={() => setShowAddTx(!showAddTx)}
                  className="text-xs text-[var(--cyan)] hover:text-white transition-colors duration-300"
                >
                  {showAddTx ? "Cancel" : "+ Add"}
                </button>
              </div>
              {showAddTx && (
                <div className="flex flex-col md:flex-row gap-3 animate-fade-in-up">
                  <input
                    type="text"
                    placeholder="Description"
                    value={newTx.description}
                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                    className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3 text-white text-sm placeholder:text-white/15 font-light focus:border-[var(--cyan)]/30 focus:shadow-[0_0_20px_rgba(0,255,255,0.06)] transition-all duration-300"
                  />
                  <select
                    value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3 text-white text-sm appearance-none"
                  >
                    {["FOOD", "SUBS", "EDU", "TRANSIT", "ENTERTAIN", "UTILITIES", "OTHER"].map(c => (
                      <option key={c} value={c} className="bg-black">{c}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Amount (PKR)"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    className="w-40 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3 text-white text-sm placeholder:text-white/15 font-light focus:border-[var(--cyan)]/30 transition-all duration-300"
                  />
                  <button
                    onClick={addTransaction}
                    className="group flex items-center justify-center gap-2 bg-[var(--cyan)] text-black px-6 py-3 rounded-full font-medium text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all duration-500 ease-[var(--ease-fluid)] active:scale-[0.97]"
                  >
                    Add
                    <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <iconify-icon icon="lucide:plus" class="text-[10px]" />
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Charts Row — Allocation 4col / Flow Dynamics 8col */}
          {s && Object.keys(s.categoryTotals).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fade-in-up delay-300">
              {/* Allocation — 4 cols */}
              <div className="md:col-span-4 doppelrand">
                <div className="doppelrand-inner p-6 md:p-8 h-full">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-6">Allocation</p>
                  <DonutChart data={s.categoryTotals} total={s.totalExpenses} />
                </div>
              </div>
              {/* Flow Dynamics — 8 cols */}
              <div className="md:col-span-8 doppelrand">
                <div className="doppelrand-inner p-6 md:p-8 h-full">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-6">Flow Dynamics</p>
                  <SpendingAreaChart transactions={data?.transactions || []} />
                  <div className="flex items-center gap-5 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00FFFF]" />
                      <span className="text-[10px] uppercase tracking-wider text-white/25">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#F472B6]" />
                      <span className="text-[10px] uppercase tracking-wider text-white/25">Expenses</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Trend */}
          {data?.transactions && data.transactions.length > 0 && (
            <div className="doppelrand animate-fade-in-up delay-400">
              <div className="doppelrand-inner p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-6">Monthly Trend</p>
                <MonthlyBarChart transactions={data.transactions} />
                <div className="flex items-center gap-5 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00FFFF]" />
                    <span className="text-[10px] uppercase tracking-wider text-white/25">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F472B6]" />
                    <span className="text-[10px] uppercase tracking-wider text-white/25">Expenses</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {data?.transactions && data.transactions.length > 0 && (
            <div className="doppelrand animate-fade-in-up delay-400">
              <div className="doppelrand-inner">
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/30">Recent Transactions</p>
                  <a href="/ledger" className="text-xs text-[var(--cyan)] hover:text-white transition-colors duration-300">
                    View all
                  </a>
                </div>
                <div className="flex flex-col">
                  {data.transactions.slice(-10).reverse().map((tx, i) => (
                    <div
                      key={tx._id}
                      className="group flex items-center justify-between px-8 py-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-all duration-300 hover:translate-x-2"
                      style={{ animationDelay: `${450 + i * 40}ms` }}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-[11px] text-white/15 w-20 shrink-0 font-mono">{tx.date}</span>
                        <span className="text-sm text-white/60 truncate">{tx.description}</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/20 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.04] shrink-0">
                          {tx.category}
                        </span>
                      </div>
                      <span className={`text-sm font-medium shrink-0 ml-4 ${
                        tx.amount >= 0 ? "text-[var(--cyan)]" : "text-red-400/70"
                      }`}>
                        {tx.amount >= 0 ? "+" : ""}Rs. {tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
