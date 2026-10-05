import { Order } from "@/models/Order";
import type { RefundDecision } from "@/types";

const REFUND_WINDOW_DAYS = 30;
const MANUAL_APPROVAL_LIMIT = 500;

export async function validateRefund(orderId: string): Promise<RefundDecision> {
  const order = await Order.findOne({ orderId });

  if (!order) {
    return {
      eligible: false,
      reason: "Order was not found.",
      requiresManualApproval: false,
      refundAmount: 0
    };
  }

  if (order.refundProcessed) {
    return {
      eligible: false,
      reason: "This order has already received a refund.",
      requiresManualApproval: false,
      refundAmount: order.amount
    };
  }

  if (order.status !== "DELIVERED") {
    return {
      eligible: false,
      reason: "Only delivered orders are eligible for a standard refund.",
      requiresManualApproval: false,
      refundAmount: order.amount
    };
  }

  if (!order.refundable) {
    return {
      eligible: false,
      reason: "This product is marked as non-refundable.",
      requiresManualApproval: false,
      refundAmount: order.amount
    };
  }

  if (!order.deliveredAt) {
    return {
      eligible: false,
      reason: "The delivery date is missing, so the refund cannot be validated.",
      requiresManualApproval: false,
      refundAmount: order.amount
    };
  }

  const ageMs = Date.now() - new Date(order.deliveredAt).getTime();
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

  if (ageDays > REFUND_WINDOW_DAYS) {
    return {
      eligible: false,
      reason: `Refund window exceeded. The order was delivered ${ageDays} days ago; policy allows ${REFUND_WINDOW_DAYS} days.`,
      requiresManualApproval: false,
      refundAmount: order.amount
    };
  }

  return {
    eligible: true,
    reason: `Order meets the standard refund policy. Delivered ${ageDays} days ago.`,
    requiresManualApproval: order.amount > MANUAL_APPROVAL_LIMIT,
    refundAmount: order.amount
  };
}

export async function processRefund(orderId: string) {
  const validation = await validateRefund(orderId);

  if (!validation.eligible) {
    throw new Error(validation.reason);
  }

  if (validation.requiresManualApproval) {
    return {
      status: "MANUAL_APPROVAL_REQUIRED" as const,
      orderId,
      amount: validation.refundAmount,
      message: "Refund requires manual approval because the amount exceeds the automatic refund limit."
    };
  }

  const updated = await Order.findOneAndUpdate(
    {
      orderId,
      refundProcessed: false
    },
    {
      $set: { refundProcessed: true }
    },
    { new: true }
  ).lean();

  if (!updated) {
    throw new Error("Refund could not be processed because the order state changed.");
  }

  return {
    status: "REFUNDED" as const,
    orderId,
    amount: updated.amount,
    message: "Refund processed successfully."
  };
}
