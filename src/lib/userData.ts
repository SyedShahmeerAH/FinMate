import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { connectToDatabase, isMongoAvailable } from "./mongodb";

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

// ---- File helpers (local dev fallback) ----

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function getUserFile(userId: string, type: string) {
  return join(DATA_DIR, `${userId}-${type}.json`);
}

function loadJson<T>(filePath: string): T[] {
  try { if (existsSync(filePath)) return JSON.parse(readFileSync(filePath, "utf-8")); } catch {}
  return [];
}

function saveJson(filePath: string, data: unknown[]) {
  ensureDir();
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ---- Transactions ----

export async function getTransactions(userId: string): Promise<Transaction[]> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    const txs = await db.collection("transactions").find({ userId }).sort({ date: -1 }).toArray();
    return txs.map((t: any) => ({ ...t, _id: t._id?.toString() || t._id })) as Transaction[];
  }
  return loadJson<Transaction>(getUserFile(userId, "transactions"));
}

export async function addTransaction(userId: string, tx: Omit<Transaction, "_id" | "userId">): Promise<Transaction> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    const doc = { ...tx, userId, _id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` };
    await db.collection("transactions").insertOne(doc as any);
    return doc;
  }
  const transactions = loadJson<Transaction>(getUserFile(userId, "transactions"));
  const newTx: Transaction = { ...tx, _id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, userId };
  transactions.push(newTx);
  saveJson(getUserFile(userId, "transactions"), transactions);
  return newTx;
}

export async function deleteTransaction(userId: string, txId: string): Promise<boolean> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    const result = await db.collection("transactions").deleteOne({ _id: txId, userId } as any);
    return result.deletedCount > 0;
  }
  const transactions = loadJson<Transaction>(getUserFile(userId, "transactions"));
  const filtered = transactions.filter(t => t._id !== txId);
  if (filtered.length === transactions.length) return false;
  saveJson(getUserFile(userId, "transactions"), filtered);
  return true;
}

// ---- Targets ----

export async function getTargets(userId: string): Promise<Target[]> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    const targets = await db.collection("targets").find({ userId }).toArray();
    return targets.map((t: any) => ({ ...t, _id: t._id?.toString() || t._id })) as Target[];
  }
  return loadJson<Target>(getUserFile(userId, "targets"));
}

export async function addTarget(userId: string, target: Omit<Target, "_id" | "userId">): Promise<Target> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    const doc = { ...target, userId, _id: `tgt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` };
    await db.collection("targets").insertOne(doc as any);
    return doc;
  }
  const targets = loadJson<Target>(getUserFile(userId, "targets"));
  const newTarget: Target = { ...target, _id: `tgt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, userId };
  targets.push(newTarget);
  saveJson(getUserFile(userId, "targets"), targets);
  return newTarget;
}

export async function updateTarget(userId: string, targetId: string, updates: Partial<Target>): Promise<Target | null> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    await db.collection("targets").updateOne({ _id: targetId, userId } as any, { $set: updates });
    const doc = await db.collection("targets").findOne({ _id: targetId, userId } as any);
    return doc ? { ...doc, _id: (doc._id as any)?.toString() || doc._id } as Target : null;
  }
  const targets = loadJson<Target>(getUserFile(userId, "targets"));
  const idx = targets.findIndex(t => t._id === targetId);
  if (idx === -1) return null;
  targets[idx] = { ...targets[idx], ...updates };
  saveJson(getUserFile(userId, "targets"), targets);
  return targets[idx];
}

export async function deleteTarget(userId: string, targetId: string): Promise<boolean> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    const result = await db.collection("targets").deleteOne({ _id: targetId, userId } as any);
    return result.deletedCount > 0;
  }
  const targets = loadJson<Target>(getUserFile(userId, "targets"));
  const filtered = targets.filter(t => t._id !== targetId);
  if (filtered.length === targets.length) return false;
  saveJson(getUserFile(userId, "targets"), filtered);
  return true;
}

// ---- Summary ----

export async function getUserSummary(userId: string) {
  const transactions = await getTransactions(userId);
  const targets = await getTargets(userId);

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
      progress: t.goal > 0 ? Math.round((t.current / t.goal) * 100) : 0,
      remaining: t.goal - t.current,
    })),
  };
}
