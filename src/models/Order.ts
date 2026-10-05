import mongoose, { Schema, type Model } from "mongoose";
import type { OrderStatus } from "@/types";

export interface IOrder {
  orderId: string;
  customerId: string;
  productName: string;
  amount: number;
  status: OrderStatus;
  deliveredAt?: Date;
  refundable: boolean;
  refundProcessed: boolean;
}

const schema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["DELIVERED", "CANCELLED", "PROCESSING"],
      required: true
    },
    deliveredAt: Date,
    refundable: { type: Boolean, default: true },
    refundProcessed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", schema);
