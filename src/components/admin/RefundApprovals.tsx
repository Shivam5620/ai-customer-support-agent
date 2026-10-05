"use client";
import { useCallback, useEffect, useState } from "react";

type Refund = { _id: string; orderId: string; customerId: string; amount: number; reason: string; requestedAt: string };

export default function RefundApprovals() {
  const [items, setItems] = useState<Refund[]>([]);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/refunds", { cache: "no-store" });
    if (response.ok) setItems((await response.json()).requests || []);
  }, []);
  useEffect(() => { load(); const timer = setInterval(load, 3000); return () => clearInterval(timer); }, [load]);
  async function review(id: string, action: "approve" | "reject") {
    setMessage("");
    const response = await fetch(`/api/admin/refunds/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const data = await response.json();
    setMessage(data.success ? `Refund ${action === "approve" ? "approved and processed" : "rejected"}.` : data.message);
    await load();
  }
  return <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
    <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Manual Refund Approvals</h2><p className="text-sm text-slate-500">Refunds above $500 require an admin decision.</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">{items.length} pending</span></div>
    {message && <p className="mb-4 rounded-lg bg-slate-100 p-3 text-sm">{message}</p>}
    {items.length === 0 ? <p className="text-sm text-slate-500">No refunds are waiting for approval.</p> : <div className="space-y-3">{items.map(item => <div key={item._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{item.orderId} · ${item.amount}</p><p className="text-sm text-slate-500">Customer: {item.customerId}</p><p className="mt-1 text-sm">{item.reason}</p></div><div className="flex gap-2"><button onClick={() => review(item._id, "reject")} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">Reject</button><button onClick={() => review(item._id, "approve")} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Approve</button></div></div>)}</div>}
  </div>;
}
