import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { clearAllUserData } from "@/lib/conversations";

async function getUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  let token = authHeader?.replace("Bearer ", "");
  if (!token) {
    const cookie = request.headers.get("Cookie");
    token = cookie?.split(";").find(c => c.trim().startsWith("token="))?.split("=")[1];
  }
  if (!token) return null;
  return verifyToken(token)?.userId || null;
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  clearAllUserData(userId);
  return NextResponse.json({ success: true });
}
