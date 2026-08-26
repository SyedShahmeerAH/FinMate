import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";

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

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFile(userId: string): string {
  return join(DATA_DIR, `${userId}-conversations.json`);
}

function readAll(userId: string): Conversation[] {
  try {
    const f = getFile(userId);
    if (existsSync(f)) return JSON.parse(readFileSync(f, "utf-8"));
  } catch {}
  return [];
}

function writeAll(userId: string, data: Conversation[]) {
  ensureDir();
  writeFileSync(getFile(userId), JSON.stringify(data, null, 2));
}

export function getConversations(userId: string): Conversation[] {
  return readAll(userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getConversation(userId: string, id: string): Conversation | null {
  return readAll(userId).find(c => c._id === id) || null;
}

export function saveConversation(userId: string, conv: Conversation): void {
  const all = readAll(userId);
  const idx = all.findIndex(c => c._id === conv._id);
  if (idx >= 0) {
    all[idx] = conv;
  } else {
    all.push(conv);
  }
  writeAll(userId, all);
}

export function createConversation(userId: string, title: string, messages: ConversationMessage[]): Conversation {
  const conv: Conversation = {
    _id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    title,
    messages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveConversation(userId, conv);
  return conv;
}

export function deleteConversation(userId: string, id: string): boolean {
  const all = readAll(userId);
  const filtered = all.filter(c => c._id !== id);
  if (filtered.length === all.length) return false;
  writeAll(userId, filtered);
  return true;
}

export function clearAllUserData(userId: string) {
  ensureDir();
  const files = [
    `${userId}-transactions.json`,
    `${userId}-targets.json`,
    `${userId}-conversations.json`,
  ];
  for (const f of files) {
    const p = join(DATA_DIR, f);
    if (existsSync(p)) unlinkSync(p);
  }
}
