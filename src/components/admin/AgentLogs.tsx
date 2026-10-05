"use client";

import { useEffect, useState } from "react";

type Log = {
  _id: string;
  sessionId: string;
  action: string;
  status: string;
  input?: unknown;
  output?: unknown;
  createdAt: string;
};

export default function AgentLogs() {
  const [logs, setLogs] = useState<Log[]>([]);

  async function loadLogs() {
    const response = await fetch("/api/logs", { cache: "no-store" });
    const data = await response.json();
    setLogs(data.logs || []);
  }

  useEffect(() => {
    loadLogs();
    const timer = setInterval(loadLogs, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="font-semibold">Agent Activity</h2>
        <p className="text-sm text-slate-500">
          Automatically refreshed every 1.5 seconds
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {logs.map((log) => (
          <div key={log._id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-sm font-medium">
                {log.action}
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  log.status === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : log.status === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {log.status}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              {new Date(log.createdAt).toLocaleString()}
            </p>

            {log.output !== undefined && (
              <pre className="mt-3 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                {JSON.stringify(log.output, null, 2)}
              </pre>
            )}
          </div>
        ))}

        {logs.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            No agent activity yet.
          </div>
        )}
      </div>
    </div>
  );
}
