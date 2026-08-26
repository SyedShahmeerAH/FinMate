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
        <main className="flex-1 h-screen overflow-y-auto bg-black p-4 md:p-16 pt-20 md:pt-16 bg-grid-pattern">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-full gap-4">
            <iconify-icon icon="lucide:loader-2" class="text-6xl text-[#00FFFF] animate-spin" />
            <p className="font-mono text-xl text-gray-500">LOADING LEDGER...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Sidebar activeNav="ledger" />
        <main className="flex-1 h-screen overflow-y-auto bg-black p-4 md:p-16 pt-20 md:pt-16 bg-grid-pattern">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-full gap-4">
            <p className="font-mono text-xl text-gray-500">LOGIN TO VIEW LEDGER</p>
            <a href="/login" className="font-mono text-[#00FFFF] hover:text-white transition-colors">LOGIN →</a>
          </div>
        </main>
      </>
    );
  }

  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <>
      <Sidebar activeNav="ledger" />
      <main className="flex-1 h-screen overflow-y-auto bg-black p-4 md:p-16 pt-20 md:pt-16 bg-grid-pattern relative scroll-smooth">
        <div className="max-w-6xl mx-auto flex flex-col gap-16 pb-20">
          <section className="flex flex-col gap-8">
            <div className="inline-flex border-2 border-gray-700 px-4 py-2 bg-[#0a0a0a]">
              <p className="font-mono text-sm md:text-base text-[#00FFFF] font-bold">
                {">"} MODULE: LEDGER // {user.name.toUpperCase()}
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight leading-[1.1]">
              Ledger
              <br />
              <span className="text-gray-500">All transactions.</span>
            </h1>
          </section>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-2 border-gray-700 p-8 bg-[#0a0a0a]">
              <p className="font-mono text-sm text-gray-500 mb-4 border-b border-gray-700 pb-2">TOTAL</p>
              <h3 className={`text-4xl font-black ${total >= 0 ? "text-[#00FFFF]" : "text-red-500"}`}>
                Rs. {total.toLocaleString()}
              </h3>
            </div>
            <div className="border-2 border-gray-700 p-8 bg-[#0a0a0a]">
              <p className="font-mono text-sm text-gray-500 mb-4 border-b border-gray-700 pb-2">TRANSACTIONS</p>
              <h3 className="text-4xl font-black text-white">{transactions.length}</h3>
            </div>
          </div>

          {/* Add Transaction */}
          <div className="border-2 border-gray-700 p-6 bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-sm text-gray-500">ADD_TRANSACTION</p>
              <button
                onClick={() => setShowAddTx(!showAddTx)}
                className="text-[#00FFFF] hover:text-white font-mono text-sm"
              >
                {showAddTx ? "CANCEL" : "+ ADD"}
              </button>
            </div>
            {showAddTx && (
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="DESCRIPTION"
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="flex-1 bg-black border-2 border-gray-700 text-white p-3 font-mono text-sm focus:border-[#00FFFF] outline-none"
                />
                <select
                  value={newTx.category}
                  onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  className="bg-black border-2 border-gray-700 text-white p-3 font-mono text-sm focus:border-[#00FFFF] outline-none"
                >
                  {["FOOD", "SUBS", "EDU", "TRANSIT", "ENTERTAIN", "UTILITIES", "OTHER"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="AMOUNT (PKR)"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  className="w-40 bg-black border-2 border-gray-700 text-white p-3 font-mono text-sm focus:border-[#00FFFF] outline-none"
                />
                <input
                  type="date"
                  value={newTx.date}
                  onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                  className="bg-black border-2 border-gray-700 text-white p-3 font-mono text-sm focus:border-[#00FFFF] outline-none"
                />
                <button
                  onClick={addTransaction}
                  className="bg-[#00FFFF] text-black px-6 py-3 font-bold hover:bg-white transition-colors"
                >
                  ADD
                </button>
              </div>
            )}
          </div>

          {/* Transaction List */}
          <div className="border-2 border-gray-700 bg-[#0a0a0a]">
            <div className="p-6 border-b-2 border-gray-700">
              <p className="font-mono text-sm text-gray-500">ALL_TRANSACTIONS</p>
            </div>
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-mono text-xl text-gray-500">NO TRANSACTIONS YET</p>
                <p className="font-mono text-sm text-gray-600 mt-2">Add one or use AI to track spending</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {transactions.map(tx => (
                  <div key={tx._id} className="flex items-center justify-between p-4 md:p-6 border-b border-gray-800 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="font-mono text-xs text-gray-600 shrink-0">{tx.date}</span>
                      <span className="font-mono text-sm text-white truncate">{tx.description}</span>
                      <span className="font-mono text-xs text-gray-500 border border-gray-700 px-2 py-0.5 shrink-0">{tx.category}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`font-mono font-bold ${tx.amount >= 0 ? "text-[#00FFFF]" : "text-red-500"}`}>
                        {tx.amount >= 0 ? "+" : ""}Rs. {tx.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx._id)}
                        className="text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <iconify-icon icon="lucide:trash-2" class="text-lg" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
