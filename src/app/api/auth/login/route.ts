import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { COOKIE_NAME, createToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ success: false, message: "Email and password are required." }, { status: 400 });
    await connectDB();
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user || !verifyPassword(String(password), user.passwordHash)) return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    const token = createToken({ userId: String(user._id), role: user.role, customerId: user.customerId });
    const response = NextResponse.json({ success: true, user: { name: user.name, email: user.email, role: user.role, customerId: user.customerId } });
    response.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 86400 });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Login failed." }, { status: 500 });
  }
}
