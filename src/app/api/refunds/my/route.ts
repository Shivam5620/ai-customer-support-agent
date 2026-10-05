import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { RefundRequest } from "@/models/RefundRequest";
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
  if (session.role !== "customer" || !session.customerId) return NextResponse.json({ success: false, message: "Customer access required." }, { status: 403 });
  await connectDB();
  const requests = await RefundRequest.find({ customerId: session.customerId }).sort({ requestedAt: -1 }).lean();
  return NextResponse.json({ success: true, requests });
}
