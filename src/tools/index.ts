import { z } from "zod";
import { findCustomer } from "@/services/customer.service";
import { findOrder } from "@/services/order.service";
import { processRefund, validateRefund } from "@/services/refund.service";
import { REFUND_POLICY } from "@/data/refund-policy";

export const toolDefinitions = [
  {
    type: "function" as const,
    name: "get_customer",
    description: "Retrieve a customer profile by customer ID.",
    parameters: {
      type: "object",
      properties: {
        customerId: { type: "string", description: "Customer ID such as CUS001." }
      },
      required: ["customerId"],
      additionalProperties: false
    }
  },
  {
    type: "function" as const,
    name: "get_order",
    description: "Retrieve an order by order ID.",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "Order ID such as ORD1001." }
      },
      required: ["orderId"],
      additionalProperties: false
    }
  },
  {
    type: "function" as const,
    name: "check_refund_policy",
    description: "Validate an order against the strict refund policy. Never override this tool's decision.",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "Order ID to validate." }
      },
      required: ["orderId"],
      additionalProperties: false
    }
  },
  {
    type: "function" as const,
    name: "process_refund",
    description: "Process an eligible automatic refund. Use only after policy validation says eligible.",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "Order ID to refund." }
      },
      required: ["orderId"],
      additionalProperties: false
    }
  }
];

const customerSchema = z.object({ customerId: z.string().min(1) });
const orderSchema = z.object({ orderId: z.string().min(1) });

export async function executeTool(name: string, rawArguments: string) {
  switch (name) {
    case "get_customer": {
      const { customerId } = customerSchema.parse(JSON.parse(rawArguments));
      const customer = await findCustomer(customerId);
      return customer ?? { found: false, message: "Customer not found." };
    }

    case "get_order": {
      const { orderId } = orderSchema.parse(JSON.parse(rawArguments));
      const order = await findOrder(orderId);
      return order ?? { found: false, message: "Order not found." };
    }

    case "check_refund_policy": {
      const { orderId } = orderSchema.parse(JSON.parse(rawArguments));
      const decision = await validateRefund(orderId);
      return {
        policy: REFUND_POLICY,
        decision
      };
    }

    case "process_refund": {
      const { orderId } = orderSchema.parse(JSON.parse(rawArguments));
      return processRefund(orderId);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
