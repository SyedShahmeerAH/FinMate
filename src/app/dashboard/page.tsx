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
        <main className="flex-1 h-screen overflow-y-auto bg-black p-4 md:p-16 pt-20 md:pt-16 bg-grid-pattern">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-full gap-4">
            <iconify-icon icon="lucide:loader-2" class="text-6xl text-[#00FFFF] animate-spin" />
            <p className="font-mono text-xl text-gray-500">LOADING DATA...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Sidebar activeNav="dashboard" />
        <main className="flex-1 h-screen overflow-y-auto bg-black p-4 md:p-16 pt-20 md:pt-16 bg-grid-pattern">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-full gap-4">
            <p className="font-mono text-xl text-gray-500">LOGIN TO VIEW DASHBOARD</p>
            <a href="/login" className="font-mono text-[#00FFFF] hover:text-white transition-colors">LOGIN →</a>
          </div>
        </main>
      </>
    );
  }

  const s = data?.summary;

  return (
    <>
      <Sidebar activeNav="dashboard" />
      <main className="flex-1 h-screen overflow-y-auto bg-black p-4 md:p-16 pt-20 md:pt-16 bg-grid-pattern relative scroll-smooth">
        <div className="max-w-6xl mx-auto flex flex-col gap-16 pb-20">
          <section className="flex flex-col gap-8">
            <div className="inline-flex border-2 border-gray-700 px-4 py-2 bg-[#0a0a0a]">
              <p className="font-mono text-sm md:text-base text-[#00FFFF] font-bold">
                {">"} MODULE: DASHBOARD // {user.name.toUpperCase()}
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight leading-[1.1]">
              Dashboard
              <br />
              <span className="text-gray-500">Your financial overview.</span>
            </h1>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "BALANCE", value: "Rs. " + (s?.balance || 0).toLocaleString(), icon: "lucide:wallet" },
              { label: "INCOME", value: "Rs. " + (s?.totalIncome || 0).toLocaleString(), icon: "lucide:trending-up" },
              { label: "EXPENSES", value: "Rs. " + (s?.totalExpenses || 0).toLocaleString(), icon: "lucide:credit-card" },
            ].map((item) => (
              <div key={item.label} className="border-2 border-gray-700 p-8 bg-[#0a0a0a]">
                <p className="font-mono text-sm text-gray-500 mb-4 border-b border-gray-700 pb-2">{item.label}</p>
                <div className="flex items-center gap-4">
                  <iconify-icon icon={item.icon} class="text-4xl text-[#00FFFF]" />
                  <h3 className="text-3xl md:text-4xl font-black text-white">{item.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Transaction */}
          <div className="border-2 border-gray-700 p-6 bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-sm text-gray-500">QUICK_ADD</p>
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
                <button
                  onClick={addTransaction}
                  className="bg-[#00FFFF] text-black px-6 py-3 font-bold hover:bg-white transition-colors"
                >
                  ADD
                </button>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          {s && Object.keys(s.categoryTotals).length > 0 && (
            <div className="border-2 border-gray-700 p-8 bg-[#0a0a0a]">
              <p className="font-mono text-sm text-gray-500 mb-6 border-b border-gray-700 pb-2">SPENDING BY CATEGORY</p>
              <div className="flex flex-col gap-4">
                {Object.entries(s.categoryTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amt]) => (
                    <div key={cat} className="flex items-center gap-4">
                      <span className="font-mono text-sm text-gray-400 w-24">{cat}</span>
                      <div className="flex-1 h-6 bg-black border border-gray-700">
                        <div
                          className="h-full bg-[#00FFFF]"
                          style={{ width: `${Math.min((amt / s.totalExpenses) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm text-white w-24 text-right">Rs. {amt.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {data?.transactions && data.transactions.length > 0 && (
            <div className="border-2 border-gray-700 p-8 bg-[#0a0a0a]">
              <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-2">
                <p className="font-mono text-sm text-gray-500">RECENT TRANSACTIONS</p>
                <a href="/ledger" className="font-mono text-sm text-[#00FFFF] hover:text-white">VIEW_ALL →</a>
              </div>
              <div className="flex flex-col gap-2">
                {data.transactions.slice(-10).reverse().map(tx => (
                  <div key={tx._id} className="flex items-center justify-between py-2 border-b border-gray-800">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-gray-600">{tx.date}</span>
                      <span className="font-mono text-sm text-white">{tx.description}</span>
                      <span className="font-mono text-xs text-gray-500 border border-gray-700 px-2 py-0.5">{tx.category}</span>
                    </div>
                    <span className={`font-mono font-bold ${tx.amount >= 0 ? "text-[#00FFFF]" : "text-red-500"}`}>
                      {tx.amount >= 0 ? "+" : ""}Rs. {tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
