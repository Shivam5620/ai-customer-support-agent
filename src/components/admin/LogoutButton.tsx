"use client";
import { useRouter } from "next/navigation";
export default function LogoutButton() { const router = useRouter(); return <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }}>Logout</button>; }
