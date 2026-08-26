import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getTargets, addTarget, updateTarget, deleteTarget } from "@/lib/userData";

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

  const targets = await getTargets(userId);
  return NextResponse.json({ targets });
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, current, goal, color } = await request.json();

    if (!name || goal === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const target = await addTarget(userId, {
      name: name.toUpperCase(),
      current: Number(current) || 0,
      goal: Number(goal),
      color: color || "bg-gray-500",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ target }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add target" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetId, updates } = await request.json();

    if (!targetId || !updates) {
      return NextResponse.json({ error: "Missing targetId or updates" }, { status: 400 });
    }

    const target = await updateTarget(userId, targetId, updates);
    if (!target) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    return NextResponse.json({ target });
  } catch {
    return NextResponse.json({ error: "Failed to update target" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetId } = await request.json();
    if (!targetId) {
      return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
    }

    const deleted = await deleteTarget(userId, targetId);
    if (!deleted) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete target" }, { status: 500 });
  }
}
