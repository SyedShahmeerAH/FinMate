import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import { connectToDatabase, isMongoAvailable } from "./mongodb";

const DATA_DIR = join(process.cwd(), ".finmate-data");

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

// ---- File helpers (local dev fallback) ----

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function getFile(userId: string) {
  return join(DATA_DIR, `${userId}-conversations.json`);
}

function readAll(userId: string): Conversation[] {
  try { const f = getFile(userId); if (existsSync(f)) return JSON.parse(readFileSync(f, "utf-8")); } catch {}
  return [];
}

function writeAll(userId: string, data: Conversation[]) {
  ensureDir();
  writeFileSync(getFile(userId), JSON.stringify(data, null, 2));
}

// ---- Public API ----

export async function getConversations(userId: string): Promise<Conversation[]> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    const convs = await db.collection("conversations").find({ userId }).sort({ updatedAt: -1 }).toArray();
    return convs.map((c: any) => ({ ...c, _id: c._id?.toString() || c._id })) as Conversation[];
  }
  return readAll(userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getConversation(userId: string, id: string): Promise<Conversation | null> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    const conv = await db.collection("conversations").findOne({ _id: id, userId } as any);
    return conv ? { ...conv, _id: (conv._id as any)?.toString() || conv._id } as Conversation : null;
  }
  return readAll(userId).find(c => c._id === id) || null;
}

export async function saveConversation(userId: string, conv: Conversation): Promise<void> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    await db.collection("conversations").updateOne(
      { _id: conv._id, userId } as any,
      { $set: conv as any },
      { upsert: true }
    );
    return;
  }
  const all = readAll(userId);
  const idx = all.findIndex(c => c._id === conv._id);
  if (idx >= 0) all[idx] = conv;
  else all.push(conv);
  writeAll(userId, all);
}

export async function createConversation(userId: string, title: string, messages: ConversationMessage[]): Promise<Conversation> {
  const conv: Conversation = {
    _id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    title,
    messages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveConversation(userId, conv);
  return conv;
}

export async function deleteConversation(userId: string, id: string): Promise<boolean> {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    const result = await db.collection("conversations").deleteOne({ _id: id, userId } as any);
    return result.deletedCount > 0;
  }
  const all = readAll(userId);
  const filtered = all.filter(c => c._id !== id);
  if (filtered.length === all.length) return false;
  writeAll(userId, filtered);
  return true;
}

export async function clearAllUserData(userId: string) {
  if (isMongoAvailable()) {
    const { db } = await connectToDatabase();
    await Promise.all([
      db.collection("transactions").deleteMany({ userId }),
      db.collection("targets").deleteMany({ userId }),
      db.collection("conversations").deleteMany({ userId }),
    ]);
    return;
  }
  ensureDir();
  for (const type of ["transactions", "targets", "conversations"]) {
    const p = join(DATA_DIR, `${userId}-${type}.json`);
    if (existsSync(p)) unlinkSync(p);
  }
}
