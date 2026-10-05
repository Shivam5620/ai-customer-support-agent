export type OrderStatus = "DELIVERED" | "CANCELLED" | "PROCESSING";

export type AgentLogStatus = "success" | "error" | "pending";

export interface RefundDecision {
  eligible: boolean;
  reason: string;
  requiresManualApproval: boolean;
  refundAmount: number;
}

export interface AgentLogRecord {
  sessionId: string;
  action: string;
  status: AgentLogStatus;
  input?: unknown;
  output?: unknown;
}
