import Link from "next/link";
import { redirect } from "next/navigation";
import AgentLogs from "@/components/admin/AgentLogs";
import RefundApprovals from "@/components/admin/RefundApprovals";
import LogoutButton from "@/components/admin/LogoutButton";
import { getSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/admin");
  if (session.role !== "admin") redirect("/unauthorized");
  return <main className="min-h-screen"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><div><h1 className="text-xl font-bold">Admin Dashboard</h1><p className="text-sm text-slate-500">Agent activity, policy enforcement and manual approvals</p></div><div className="flex gap-2"><Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium">Customer Chat</Link><LogoutButton /></div></div></header><section className="mx-auto max-w-6xl px-6 py-10"><div className="mb-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Agent</p><p className="mt-1 text-2xl font-bold">Online</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Policy</p><p className="mt-1 text-2xl font-bold">Strict</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Approval Limit</p><p className="mt-1 text-2xl font-bold">$500</p></div></div><RefundApprovals /><AgentLogs /></section></main>;
}
