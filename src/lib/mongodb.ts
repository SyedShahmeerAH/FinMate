import { MongoClient, Db } from "mongodb";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "finmate";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// File-based fallback for development when MongoDB is unreachable
const DB_FILE = join(process.cwd(), ".finmate-users.json");

interface StoredUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

function loadUsers(): StoredUser[] {
  try {
    if (existsSync(DB_FILE)) {
      return JSON.parse(readFileSync(DB_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveUsers(users: StoredUser[]) {
  writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

export function addUser(user: Omit<StoredUser, "_id">): StoredUser {
  const users = loadUsers();
  const newUser = { ...user, _id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return loadUsers().find(u => u.email === email);
}

export function findUserById(id: string): StoredUser | undefined {
  return loadUsers().find(u => u._id === id);
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    
    await client.db("admin").command({ ping: 1 });
    
    const db = client.db(MONGODB_DB);
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch {
    throw new Error("MONGODB_UNREACHABLE");
  }
}
