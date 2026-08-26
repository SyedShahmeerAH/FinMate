import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectToDatabase, isMongoAvailable } from "./mongodb";
import { ObjectId } from "mongodb";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const JWT_SECRET = process.env.JWT_SECRET || "finmate-secret-key-change-in-production";
const DB_FILE = join(process.cwd(), ".finmate-users.json");

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface StoredUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

function loadUsers(): StoredUser[] {
  try { if (existsSync(DB_FILE)) return JSON.parse(readFileSync(DB_FILE, "utf-8")); } catch {}
  return [];
}

function saveUsers(users: StoredUser[]) {
  writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function createUser(name: string, email: string, password: string): Promise<SafeUser> {
  const hashedPassword = await hashPassword(password);

  // Try MongoDB first
  if (isMongoAvailable()) {
    try {
      const { db } = await connectToDatabase();
      const existingUser = await db.collection("users").findOne({ email });
      if (existingUser) throw new Error("User already exists");

      const user = { name, email, password: hashedPassword, createdAt: new Date() };
      const result = await db.collection("users").insertOne(user);
      return { _id: result.insertedId.toString(), name, email, createdAt: user.createdAt };
    } catch (e) {
      if (e instanceof Error && e.message === "User already exists") throw e;
      // On Vercel (production), don't fall back to files — throw
      if (process.env.VERCEL) throw new Error("Database unavailable. Check MongoDB connection.");
      // Fall through to file-based on local dev
    }
  }

  // File-based fallback
  const users = loadUsers();
  if (users.find(u => u.email === email)) {
    throw new Error("User already exists");
  }
  const newUser: StoredUser = {
    _id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name, email, password: hashedPassword, createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return { _id: newUser._id, name, email, createdAt: new Date(newUser.createdAt) };
}

export async function loginUser(email: string, password: string): Promise<{ user: SafeUser; token: string }> {
  let user: any = null;

  // Try MongoDB first
  if (isMongoAvailable()) {
    try {
      const { db } = await connectToDatabase();
      user = await db.collection("users").findOne({ email });
    } catch {
      if (process.env.VERCEL) throw new Error("Database unavailable. Check MongoDB connection.");
      // Fall through to file-based on local dev
    }
  }

  // File-based fallback
  if (!user) {
    const found = loadUsers().find(u => u.email === email);
    if (found) {
      user = { _id: found._id, name: found.name, email: found.email, password: found.password, createdAt: new Date(found.createdAt) };
    }
  }

  if (!user) throw new Error("Invalid credentials");

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) throw new Error("Invalid credentials");

  const token = generateToken(user._id.toString());
  return {
    user: { _id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt },
    token,
  };
}

export async function getUserFromToken(token: string): Promise<SafeUser | null> {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Try MongoDB first
  if (isMongoAvailable()) {
    try {
      const { db } = await connectToDatabase();
      const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) }) as any;
      if (user) return { _id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt };
    } catch {
      if (process.env.VERCEL) return null;
      // Fall through to file-based on local dev
    }
  }

  // File-based fallback
  const found = loadUsers().find(u => u._id === decoded.userId);
  if (!found) return null;
  return { _id: found._id, name: found.name, email: found.email, createdAt: new Date(found.createdAt) };
}
