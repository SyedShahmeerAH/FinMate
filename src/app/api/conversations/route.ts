import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getConversations, getConversation, deleteConversation } from "@/lib/conversations";

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

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const convId = url.searchParams.get("id");

  if (convId) {
    const conv = getConversation(userId, convId);
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(conv);
  }

  const conversations = getConversations(userId);
  // Return conversations with messages for list view
  return NextResponse.json(conversations);
}

export async function DELETE(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await request.json();
  deleteConversation(userId, conversationId);
  return NextResponse.json({ success: true });
}
