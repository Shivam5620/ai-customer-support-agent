import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AgentLog } from "@/models/AgentLog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    await connectDB();

    const filter = sessionId ? { sessionId } : {};

    const logs = await AgentLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json(
      { message: "Unable to load agent logs." },
      { status: 500 }
    );
  }
}
