import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import { runAgent } from "@/services/agent.service";

const requestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    console.log("➡️ Agent API request received");

    const body = await request.json();

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    console.log("✅ Request validated");

    await connectDB();

    console.log("✅ MongoDB connected");

    const result = await runAgent({
      message: parsed.data.message,
      sessionId: parsed.data.sessionId,
    });

    console.log("✅ Agent result:", result);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        sessionId: result.sessionId,
        mode: result.mode,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Agent API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}