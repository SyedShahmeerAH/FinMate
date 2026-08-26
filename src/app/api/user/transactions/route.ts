import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getTransactions, addTransaction, deleteTransaction } from "@/lib/userData";

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

  const transactions = await getTransactions(userId);
  return NextResponse.json({ transactions });
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { date, description, category, amount } = await request.json();

    if (!description || !category || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tx = await addTransaction(userId, {
      date: date || new Date().toISOString().split("T")[0],
      description: description.toUpperCase(),
      category: category.toUpperCase(),
      amount: Number(amount),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ transaction: tx }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add transaction" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { txId } = await request.json();
    if (!txId) {
      return NextResponse.json({ error: "Missing txId" }, { status: 400 });
    }

    const deleted = await deleteTransaction(userId, txId);
    if (!deleted) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
