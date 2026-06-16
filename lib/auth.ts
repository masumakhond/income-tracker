import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "./constants";

export type SessionUser = {
  username: string;
  name: string;
};

const ADMIN_ACCOUNTS = [
  {
    username: "masumbillahakhond",
    name: "Masum",
    password: process.env.ADMIN_PASSWORD_MASUM || "Ma$um@1995",
  },
  {
    username: "toyeeba",
    name: "Toyeeba",
    password: process.env.ADMIN_PASSWORD_TOYEEBA || "toyeeb@99",
  },
];

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function verifyAdmin(
  username: string,
  password: string
): Promise<SessionUser | null> {
  const normalized = username.trim().toLowerCase();
  const account = ADMIN_ACCOUNTS.find((item) => item.username === normalized);
  if (!account || account.password !== password) return null;
  return { username: account.username, name: account.name };
}

export async function createToken(user: SessionUser) {
  return new SignJWT({ username: user.username, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      username: payload.username as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
