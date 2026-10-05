import mongoose, { Schema, type Model } from "mongoose";
import type { AgentLogStatus } from "@/types";

export interface IAgentLog {
  sessionId: string;
  action: string;
  status: AgentLogStatus;
  input?: unknown;
  output?: unknown;
}

const schema = new Schema<IAgentLog>(
  {
    sessionId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    status: {
      type: String,
      enum: ["success", "error", "pending"],
      required: true
    },
    input: Schema.Types.Mixed,
    output: Schema.Types.Mixed
  },
  { timestamps: true }
);

schema.index({ createdAt: -1 });

export const AgentLog: Model<IAgentLog> =
  mongoose.models.AgentLog || mongoose.model<IAgentLog>("AgentLog", schema);
