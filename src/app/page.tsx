import Link from "next/link";
import ChatWindow from "@/components/chat/ChatWindow";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">AI Support Agent</h1>
            <p className="text-sm text-slate-500">
              E-commerce refund automation
            </p>
          </div>

          <div className="flex gap-2">
          <Link href="/login" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium">Sign in</Link>
          <Link
            href="/admin"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Admin Dashboard
          </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">
            How can I help with your refund?
          </h2>
          <p className="mt-2 text-slate-500">
            The agent retrieves customer/order data and validates the strict
            refund policy before taking action.
          </p>
        </div>

        <ChatWindow />
      </section>
    </main>
  );
}
