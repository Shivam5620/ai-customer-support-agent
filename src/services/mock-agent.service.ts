import { randomUUID } from "crypto";
import { AgentLog } from "@/models/AgentLog";
import { executeTool } from "@/tools";
import { createManualRefundRequest } from "@/services/manual-refund.service";

type ToolResult = Record<string, unknown>;

async function log(
  sessionId: string,
  action: string,
  status: "success" | "error" | "pending",
  input?: unknown,
  output?: unknown
) {
  await AgentLog.create({ sessionId, action, status, input, output });
}

function extractOrderId(message: string) {
  const match = message.match(/\bORD\d{4,}\b/i);
  return match?.[0].toUpperCase();
}

function extractCustomerId(message: string) {
  const match = message.match(/\bCUS\d{3,}\b/i);
  return match?.[0].toUpperCase();
}

async function runTool(sessionId: string, name: string, args: object) {
  await log(sessionId, `tool:${name}`, "pending", { arguments: args });

  try {
    const result = (await executeTool(name, JSON.stringify(args))) as ToolResult;

    await log(
      sessionId,
      `tool:${name}`,
      "success",
      { arguments: args },
      result
    );

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tool execution failed.";

    await log(
      sessionId,
      `tool:${name}`,
      "error",
      { arguments: args },
      { error: message }
    );

    throw error;
  }
}

export async function runMockAgent(message: string, sessionId?: string) {
  const id = sessionId || randomUUID();

  await log(id, "agent_started", "success", {
    message,
    mode: "mock"
  });

  const orderId = extractOrderId(message);
  const customerId = extractCustomerId(message);

  if (!orderId) {
    const answer =
      "Sure. Please provide your order ID, for example ORD1001, so I can check the refund policy.";

    await log(id, "agent_completed", "success", undefined, { answer });

    return {
      sessionId: id,
      mode: "mock",
      message: answer
    };
  }

  if (customerId) {
    await runTool(id, "get_customer", { customerId });
  }

  const order = await runTool(id, "get_order", { orderId });

  if (order.found === false) {
    const answer = `I couldn't find ${orderId}. Please check the order ID and try again.`;

    await log(id, "agent_completed", "success", undefined, { answer });

    return {
      sessionId: id,
      mode: "mock",
      message: answer
    };
  }

  const policyResult = await runTool(id, "check_refund_policy", { orderId });
  const decision = policyResult.decision as {
    eligible: boolean;
    reason: string;
    requiresManualApproval: boolean;
    refundAmount: number;
  };

  if (!decision.eligible) {
    const answer = `I’m sorry, but I can’t process a refund for ${orderId}. ${decision.reason}`;

    await log(id, "agent_completed", "success", undefined, {
      answer,
      decision: "DENIED"
    });

    return {
      sessionId: id,
      mode: "mock",
      message: answer
    };
  }

  if (decision.requiresManualApproval) {
    await createManualRefundRequest(orderId);
    const answer = `Your order ${orderId} is eligible for a refund of $${decision.refundAmount}, but it requires manual approval because the amount is above the automatic refund limit. I have sent the request to the admin approval queue.`;

    await log(id, "agent_completed", "success", undefined, {
      answer,
      decision: "MANUAL_APPROVAL_REQUIRED"
    });

    return {
      sessionId: id,
      mode: "mock",
      message: answer
    };
  }

  const refundResult = await runTool(id, "process_refund", { orderId });

  const answer =
    refundResult.status === "REFUNDED"
      ? `Your refund for ${orderId} has been processed successfully for $${refundResult.amount}.`
      : String(refundResult.message || "The refund could not be completed.");

  await log(id, "agent_completed", "success", undefined, {
    answer,
    decision: refundResult.status
  });

  return {
    sessionId: id,
    mode: "mock",
    message: answer
  };
}
