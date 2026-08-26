import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "finmate-secret-key-change-in-production";

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
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
  const { db } = await connectToDatabase();

  const existingUser = await db.collection("users").findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = {
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  };

  const result = await db.collection("users").insertOne(user);

  return {
    _id: result.insertedId.toString(),
    name,
    email,
    createdAt: user.createdAt,
  };
}

export async function loginUser(email: string, password: string): Promise<{ user: SafeUser; token: string }> {
  const { db } = await connectToDatabase();
  const user = await db.collection("users").findOne({ email }) as any;

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id.toString());

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function getUserFromToken(token: string): Promise<SafeUser | null> {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const { db } = await connectToDatabase();
  const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) }) as any;

  if (!user) return null;

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
