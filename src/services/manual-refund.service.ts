import { RefundRequest } from "@/models/RefundRequest";
import { Order } from "@/models/Order";
import { validateRefund } from "@/services/refund.service";

export async function createManualRefundRequest(orderId: string) {
  const validation = await validateRefund(orderId);
  if (!validation.eligible || !validation.requiresManualApproval) throw new Error(validation.reason || "Manual approval is not required.");
  const order = await Order.findOne({ orderId }).lean();
  if (!order) throw new Error("Order was not found.");
  const existing = await RefundRequest.findOne({ orderId, status: "PENDING_APPROVAL" }).lean();
  if (existing) return existing;
  return RefundRequest.create({ orderId, customerId: order.customerId, amount: order.amount, reason: "Refund amount exceeds the $500 automatic approval limit.", status: "PENDING_APPROVAL" });
}

export async function approveManualRefund(requestId: string, adminId: string, adminNote?: string) {
  const request = await RefundRequest.findById(requestId);
  if (!request || request.status !== "PENDING_APPROVAL") throw new Error("Pending refund request was not found.");
  const validation = await validateRefund(request.orderId);
  if (!validation.eligible) throw new Error(validation.reason);
  const updatedOrder = await Order.findOneAndUpdate({ orderId: request.orderId, refundProcessed: false }, { $set: { refundProcessed: true } }, { new: true });
  if (!updatedOrder) throw new Error("Refund could not be processed because the order state changed.");
  request.status = "REFUNDED";
  request.reviewedAt = new Date();
  request.reviewedBy = adminId;
  request.adminNote = adminNote || "Approved by admin.";
  await request.save();
  return request;
}

export async function rejectManualRefund(requestId: string, adminId: string, adminNote?: string) {
  const request = await RefundRequest.findById(requestId);
  if (!request || request.status !== "PENDING_APPROVAL") throw new Error("Pending refund request was not found.");
  request.status = "REJECTED";
  request.reviewedAt = new Date();
  request.reviewedBy = adminId;
  request.adminNote = adminNote || "Rejected by admin.";
  await request.save();
  return request;
}
