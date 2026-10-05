import { Order } from "@/models/Order";

export async function findOrder(orderId: string) {
  return Order.findOne({ orderId }).lean();
}
