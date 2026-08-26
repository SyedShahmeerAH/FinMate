import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".finmate-data");

export interface Transaction {
  _id: string;
  userId: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  createdAt: string;
}

export interface Target {
  _id: string;
  userId: string;
  name: string;
  current: number;
  goal: number;
  color: string;
  createdAt: string;
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    const { mkdirSync } = require("fs");
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getUserFile(userId: string, type: "transactions" | "targets") {
  return join(DATA_DIR, `${userId}-${type}.json`);
}

function loadJson<T>(filePath: string): T[] {
  try {
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, "utf-8"));
    }
  } catch {}
  return [];
}

function saveJson<T>(filePath: string, data: T[]) {
  ensureDir();
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Transactions
export function getTransactions(userId: string): Transaction[] {
  return loadJson<Transaction>(getUserFile(userId, "transactions"));
}

export function addTransaction(userId: string, tx: Omit<Transaction, "_id" | "userId">): Transaction {
  const transactions = getTransactions(userId);
  const newTx: Transaction = {
    ...tx,
    _id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
  };
  transactions.push(newTx);
  saveJson(getUserFile(userId, "transactions"), transactions);
  return newTx;
}

export function deleteTransaction(userId: string, txId: string): boolean {
  const transactions = getTransactions(userId);
  const filtered = transactions.filter(t => t._id !== txId);
  if (filtered.length === transactions.length) return false;
  saveJson(getUserFile(userId, "transactions"), filtered);
  return true;
}

// Targets
export function getTargets(userId: string): Target[] {
  return loadJson<Target>(getUserFile(userId, "targets"));
}

export function addTarget(userId: string, target: Omit<Target, "_id" | "userId">): Target {
  const targets = getTargets(userId);
  const newTarget: Target = {
    ...target,
    _id: `tgt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
  };
  targets.push(newTarget);
  saveJson(getUserFile(userId, "targets"), targets);
  return newTarget;
}

export function updateTarget(userId: string, targetId: string, updates: Partial<Target>): Target | null {
  const targets = getTargets(userId);
  const idx = targets.findIndex(t => t._id === targetId);
  if (idx === -1) return null;
  targets[idx] = { ...targets[idx], ...updates };
  saveJson(getUserFile(userId, "targets"), targets);
  return targets[idx];
}

export function deleteTarget(userId: string, targetId: string): boolean {
  const targets = getTargets(userId);
  const filtered = targets.filter(t => t._id !== targetId);
  if (filtered.length === targets.length) return false;
  saveJson(getUserFile(userId, "targets"), filtered);
  return true;
}

// Summary
export function getUserSummary(userId: string) {
  const transactions = getTransactions(userId);
  const targets = getTargets(userId);

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  const categoryTotals: Record<string, number> = {};
  transactions.filter(t => t.amount < 0).forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
  });

  return {
    balance,
    totalIncome,
    totalExpenses,
    transactionCount: transactions.length,
    categoryTotals,
    targets: targets.map(t => ({
      name: t.name,
      progress: Math.round((t.current / t.goal) * 100),
      remaining: t.goal - t.current,
    })),
  };
}
