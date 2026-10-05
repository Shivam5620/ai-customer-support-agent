import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { approveManualRefund, rejectManualRefund } from "@/services/manual-refund.service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ success: false, message: "Admin access required." }, { status: 403 });
    const { id } = await context.params;
    const { action, note } = await request.json();
    if (action !== "approve" && action !== "reject") return NextResponse.json({ success: false, message: "Action must be approve or reject." }, { status: 400 });
    await connectDB();
    const result = action === "approve" ? await approveManualRefund(id, session.userId, note) : await rejectManualRefund(id, session.userId, note);
    return NextResponse.json({ success: true, request: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to review refund." }, { status: 400 });
  }
}
