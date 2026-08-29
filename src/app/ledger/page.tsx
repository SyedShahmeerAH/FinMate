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

  return (
    <>
      <Sidebar activeNav="ledger" />
      <main className="md:ml-[296px] min-h-screen p-6 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-20">

          {/* Header */}
          <section className="flex flex-col gap-6 animate-fade-in-up">
            <div className="eyebrow">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
              Ledger — {user.name}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05]">
              Ledger
            </h1>
          </section>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up delay-100">
            <div className="doppelrand">
              <div className="doppelrand-inner p-6">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-3">Total</p>
                <h3 className={`text-2xl md:text-3xl font-bold ${total >= 0 ? "text-[var(--cyan)]" : "text-red-400/70"}`}>
                  Rs. {total.toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="doppelrand">
              <div className="doppelrand-inner p-6">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-3">Transactions</p>
                <h3 className="text-2xl md:text-3xl font-bold text-white">{transactions.length}</h3>
              </div>
            </div>
          </div>

          {/* Add Transaction */}
          <div className="doppelrand animate-fade-in-up delay-150">
            <div className="doppelrand-inner p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30">Add Transaction</p>
                <button
                  onClick={() => setShowAddTx(!showAddTx)}
                  className="text-xs text-[var(--cyan)] hover:text-white transition-colors duration-300"
                >
                  {showAddTx ? "Cancel" : "+ Add"}
                </button>
              </div>
              {showAddTx && (
                <div className="flex flex-col md:flex-row gap-3 animate-fade-in-up">
                  <input type="text" placeholder="Description" value={newTx.description}
                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                    className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3 text-white text-sm placeholder:text-white/15 font-light" />
                  <select value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3 text-white text-sm appearance-none">
                    {["FOOD", "SUBS", "EDU", "TRANSIT", "ENTERTAIN", "UTILITIES", "OTHER"].map(c => (
                      <option key={c} value={c} className="bg-black">{c}</option>
                    ))}
                  </select>
                  <input type="number" placeholder="Amount (PKR)" value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    className="w-40 bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3 text-white text-sm placeholder:text-white/15 font-light" />
                  <input type="date" value={newTx.date}
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                    className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-3 text-white text-sm appearance-none" />
                  <button onClick={addTransaction}
                    className="group flex items-center justify-center gap-2 bg-[var(--cyan)] text-black px-6 py-3 rounded-full font-medium text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all duration-500 active:scale-[0.97]">
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Transaction List */}
          <div className="doppelrand animate-fade-in-up delay-200">
            <div className="doppelrand-inner">
              <div className="px-8 py-5 border-b border-white/[0.04]">
                <p className="text-xs uppercase tracking-[0.15em] text-white/30">All Transactions</p>
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
                      className="flex items-center justify-between px-8 py-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${250 + i * 30}ms` }}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="text-[11px] text-white/15 w-20 shrink-0 font-mono">{tx.date}</span>
                        <span className="text-sm text-white/60 truncate">{tx.description}</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/20 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.04] shrink-0">
                          {tx.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className={`text-sm font-medium ${tx.amount >= 0 ? "text-[var(--cyan)]" : "text-red-400/70"}`}>
                          {tx.amount >= 0 ? "+" : ""}Rs. {tx.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => deleteTransaction(tx._id)}
                          className="text-white/10 hover:text-red-400 transition-colors duration-300 p-1"
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
      </main>
    </>
  );
}
