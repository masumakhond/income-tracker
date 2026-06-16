import { NextResponse } from "next/server";
import { createToken, setAuthCookie, verifyAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json({ error: "Enter username and password" }, { status: 400 });
    }

    const user = await verifyAdmin(username, password);

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = await createToken(user);
    await setAuthCookie(token);

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Login error:", error);
    const message =
      error instanceof Error && error.message.includes("JWT_SECRET")
        ? "Server misconfigured: add JWT_SECRET in Vercel environment variables."
        : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
