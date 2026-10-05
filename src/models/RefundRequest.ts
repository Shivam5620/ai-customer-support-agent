import mongoose, { Schema, type Model } from "mongoose";

export type RefundRequestStatus = "PENDING_APPROVAL" | "REJECTED" | "REFUNDED";

export interface IRefundRequest {
  orderId: string;
  customerId: string;
  amount: number;
  reason: string;
  status: RefundRequestStatus;
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminNote?: string;
}

const schema = new Schema<IRefundRequest>({
  orderId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["PENDING_APPROVAL", "REJECTED", "REFUNDED"], default: "PENDING_APPROVAL", index: true },
  requestedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: String,
  adminNote: String
}, { timestamps: true });

schema.index({ orderId: 1, status: 1 });

export const RefundRequest: Model<IRefundRequest> = mongoose.models.RefundRequest || mongoose.model<IRefundRequest>("RefundRequest", schema);
