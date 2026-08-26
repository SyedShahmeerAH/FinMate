import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserSummary, getTransactions, getTargets } from "@/lib/userData";

async function getUserId(request: Request): Promise<string | null> {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "") 
    || request.headers.get("Cookie")?.split(";").find(c => c.trim().startsWith("token="))?.split("=")[1];
  
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.userId || null;
}

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getUserSummary(userId);
  const transactions = await getTransactions(userId);
  const targets = await getTargets(userId);

  return NextResponse.json({ summary, transactions, targets });
}
