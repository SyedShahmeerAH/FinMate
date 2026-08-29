"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
  _id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

export default function LedgerPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTx, setShowAddTx] = useState(false);
  const [newTx, setNewTx] = useState({ description: "", category: "FOOD", amount: "", date: new Date().toISOString().split("T")[0] });

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/user/transactions", { headers: { Authorization: "Bearer " + token } });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
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
          date: newTx.date,
          description: newTx.description.toUpperCase(),
          category: newTx.category,
          amount: -Math.abs(Number(newTx.amount)),
        }),
      });
      setNewTx({ description: "", category: "FOOD", amount: "", date: new Date().toISOString().split("T")[0] });
      setShowAddTx(false);
      fetchTransactions();
    } catch { /* silent */ }
  };

  const deleteTransaction = async (txId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch("/api/user/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ txId }),
      });
      fetchTransactions();
    } catch { /* silent */ }
  };

  if (authLoading || loading) {
    return (
      <>
        <Sidebar activeNav="ledger" />
        <main className="md:ml-[296px] min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--cyan)]/30 border-t-[var(--cyan)] animate-spin mx-auto" />
            <p className="text-sm text-white/20">Loading ledger...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Sidebar activeNav="ledger" />
        <main className="md:ml-[296px] min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-4 animate-fade-in-up">
            <p className="text-lg text-white/30">Sign in to view ledger</p>
            <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-[var(--cyan)] text-sm hover:bg-white/[0.1] transition-all duration-300">
              Sign in
              <iconify-icon icon="lucide:arrow-right" class="text-xs" />
            </a>
          </div>
        </main>
      </>
    );
  }

  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTx = transactions.filter(tx => tx.date.startsWith(thisMonth));
  const monthExpenses = monthTx.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const incomeTx = transactions.filter(tx => tx.amount > 0);
  const topCategory = transactions.length > 0
    ? Object.entries(transactions.reduce((acc: Record<string, number>, tx) => { if (tx.amount < 0) acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount); return acc; }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
    : "N/A";
  const savingsRate = total > 0 && incomeTx.length > 0
    ? Math.round((incomeTx.reduce((s, tx) => s + tx.amount, 0) - Math.abs(transactions.filter(tx => tx.amount < 0).reduce((s, tx) => s + tx.amount, 0))) / incomeTx.reduce((s, tx) => s + tx.amount, 0) * 100)
    : 0;

  return (
    <>
      <Sidebar activeNav="ledger" />
      <main className="md:ml-[296px] min-h-screen p-6 md:p-12 lg:p-16">
        <div className="max-w-7xl mx-auto flex flex-col gap-12 pb-20">

          {/* Header */}
          <section className="flex flex-col gap-6 animate-fade-in-up">
            <div className="eyebrow">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
              Live Ledger View
            </div>
            <h1 className="text-[clamp(3rem,8vw,6rem)] font-black text-white tracking-[-0.04em] leading-[0.85]">
              Transaction<br />Vault.
            </h1>
            <div className="flex items-baseline gap-6 mt-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-1">Net Balance</p>
                <p className={`text-3xl font-black tracking-tight ${total >= 0 ? "text-[var(--cyan)]" : "text-red-400/70"}`}>
                  Rs. {total.toLocaleString()}
                </p>
              </div>
              <div className="w-px h-8 bg-white/[0.06]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-1">Monthly Burn</p>
                <p className="text-3xl font-black text-white/80 tracking-tight">
                  Rs. {monthExpenses.toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          {/* 3-Column Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up delay-100">
            {/* Income Source */}
            <div className="doppelrand">
              <div className="doppelrand-inner p-6">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-4">Income Source</p>
                <h3 className="text-2xl font-black text-[var(--cyan)] tracking-tight mb-3">
                  Rs. {incomeTx.reduce((s, tx) => s + tx.amount, 0).toLocaleString()}
                </h3>
                <div className="w-full h-1 rounded-full bg-white/[0.03] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--cyan)] transition-all duration-700 progress-glow"
                    style={{ width: `${Math.min(100, Math.round(incomeTx.reduce((s, tx) => s + tx.amount, 0) / Math.max(1, total) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Top Category */}
            <div className="doppelrand">
              <div className="doppelrand-inner p-6">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-4">Top Category</p>
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">{topCategory}</h3>
                <div className="w-full h-1 rounded-full bg-white/[0.03] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-400 transition-all duration-700"
                    style={{ width: "72%" }}
                  />
                </div>
              </div>
            </div>

            {/* Savings Rate */}
            <div className="doppelrand">
              <div className="doppelrand-inner p-6">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-4">Savings Rate</p>
                <h3 className="text-2xl font-black text-emerald-400 tracking-tight mb-3">{savingsRate}%</h3>
                <div className="w-full h-1 rounded-full bg-white/[0.03] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                    style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="doppelrand animate-fade-in-up delay-200">
            <div className="doppelrand-inner">
              <div className="px-8 py-5 border-b border-white/[0.04] flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30">All Transactions</p>
                <button
                  onClick={() => setShowAddTx(!showAddTx)}
                  className="text-xs text-[var(--cyan)] hover:text-white transition-colors duration-300"
                >
                  {showAddTx ? "Cancel" : "+ New Entry"}
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-white/20 text-lg">No transactions yet</p>
                  <p className="text-white/10 text-sm mt-2">Add one or use AI to track spending</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {transactions.map((tx, i) => (
                    <div
                      key={tx._id}
                      className="group flex items-center justify-between px-8 py-4 border-b border-white/[0.03] last:border-0 rounded-[2rem] hover:bg-white/[0.02] transition-all duration-300 hover:translate-x-2 animate-fade-in-up"
                      style={{ animationDelay: `${250 + i * 30}ms` }}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="text-[11px] text-white/15 w-20 shrink-0 font-mono">{tx.date}</span>
                        <span className="text-sm text-white/60 truncate">{tx.description}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                          tx.amount >= 0
                            ? "text-[var(--cyan)] bg-[var(--cyan)]/5 border-[var(--cyan)]/10"
                            : "text-white/20 bg-white/[0.03] border-white/[0.04]"
                        }`}>
                          {tx.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className={`text-sm font-medium ${tx.amount >= 0 ? "text-[var(--cyan)]" : "text-red-400/70"}`}>
                          {tx.amount >= 0 ? "+" : ""}Rs. {tx.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => deleteTransaction(tx._id)}
                          className="text-white/10 hover:text-red-400 transition-colors duration-300 p-1 opacity-0 group-hover:opacity-100"
                        >
                          <iconify-icon icon="lucide:trash-2" class="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Add Transaction Modal */}
        {showAddTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddTx(false)}
            />
            <div className="relative doppelrand w-full max-w-lg animate-fade-in-scale">
              <div className="doppelrand-inner p-8">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs uppercase tracking-[0.15em] text-white/30">New Transaction</p>
                  <button
                    onClick={() => setShowAddTx(false)}
                    className="text-white/20 hover:text-white transition-colors"
                  >
                    <iconify-icon icon="lucide:x" class="text-lg" />
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Description"
                    value={newTx.description}
                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3.5 text-white text-sm placeholder:text-white/15 font-light focus:border-[var(--cyan)]/30 focus:shadow-[0_0_20px_rgba(0,255,255,0.06)] transition-all duration-300"
                  />
                  <div className="flex gap-3">
                    <select
                      value={newTx.category}
                      onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                      className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3.5 text-white text-sm appearance-none"
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
                      className="w-40 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3.5 text-white text-sm placeholder:text-white/15 font-light focus:border-[var(--cyan)]/30 transition-all duration-300"
                    />
                  </div>
                  <input
                    type="date"
                    value={newTx.date}
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3.5 text-white text-sm appearance-none"
                  />
                  <button
                    onClick={addTransaction}
                    className="group w-full flex items-center justify-center gap-2 bg-[var(--cyan)] text-black py-3.5 rounded-full font-medium text-sm hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all duration-500 ease-[var(--ease-fluid)] active:scale-[0.97] mt-1"
                  >
                    Add Transaction
                    <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <iconify-icon icon="lucide:plus" class="text-[10px]" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
