import crypto from "crypto";
import { cookies } from "next/headers";

export type AuthPayload = { userId: string; role: "customer" | "admin"; customerId?: string; exp: number };
const COOKIE_NAME = "auth_token";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not configured.");
  return value;
}

function encode(value: string) { return Buffer.from(value).toString("base64url"); }
function decode(value: string) { return Buffer.from(value, "base64url").toString("utf8"); }
function sign(value: string) { return crypto.createHmac("sha256", secret()).update(value).digest("base64url"); }

export function createToken(payload: Omit<AuthPayload, "exp">) {
  const body = encode(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 }));
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string): AuthPayload {
  const [body, signature] = token.split(".");
  if (!body || !signature) throw new Error("Invalid session.");
  const expected = sign(body);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error("Invalid session.");
  const payload = JSON.parse(decode(body)) as AuthPayload;
  if (payload.exp < Date.now()) throw new Error("Session expired.");
  return payload;
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try { return verifyToken(token); } catch { return null; }
}

export { COOKIE_NAME };
