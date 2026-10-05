import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";

export async function GET() {
  await connectDB();
  const customers = await Customer.find().sort({ customerId: 1 }).lean();
  return NextResponse.json({ customers });
}
