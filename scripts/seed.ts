import dotenv from "dotenv";
import mongoose from "mongoose";

import { Customer } from "../src/models/Customer";
import { Order } from "../src/models/Order";
import { customers } from "../src/data/customers";
import { orders } from "../src/data/orders";
import { User } from "../src/models/User";
import { RefundRequest } from "../src/models/RefundRequest";
import { hashPassword } from "../src/lib/password";

dotenv.config({
  path: ".env.local",
});

const mongoUri = process.env.MONGODB_URI;

console.log("MONGODB_URI loaded:", Boolean(mongoUri));

if (!mongoUri) {
  throw new Error(
    "MONGODB_URI is missing. Check your .env.local file."
  );
}

async function seed() {
  try {
    await mongoose.connect(mongoUri!);

    console.log("MongoDB connected successfully.");

    await Customer.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});
    await RefundRequest.deleteMany({});

    await Customer.insertMany(customers);
    await Order.insertMany(orders);

    await User.insertMany([
      { name: "System Admin", email: "admin@example.com", passwordHash: hashPassword("Admin@123"), role: "admin" },
      { name: "Customer One", email: "customer@example.com", passwordHash: hashPassword("Customer@123"), role: "customer", customerId: "CUS001" }
    ]);

    console.log(`Customers seeded: ${customers.length}`);
    console.log(`Orders seeded: ${orders.length}`);
    console.log("Demo users seeded: admin@example.com and customer@example.com");
    console.log("Database seed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();