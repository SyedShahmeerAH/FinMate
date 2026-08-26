import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      // Also check cookie
      const cookieHeader = request.headers.get("Cookie");
      const tokenCookie = cookieHeader?.split(";").find(c => c.trim().startsWith("token="));
      const cookieToken = tokenCookie?.split("=")[1];
      
      if (!cookieToken) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 });
      }
      
      const user = await getUserFromToken(cookieToken);
      if (!user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      
      return NextResponse.json({ user });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
