import { Customer } from "@/models/Customer";

export async function findCustomer(customerId: string) {
  return Customer.findOne({ customerId }).lean();
}
