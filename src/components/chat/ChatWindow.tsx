"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I’m your refund support agent. Tell me your order ID and what you need help with."
    }
  ]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [agentMode, setAgentMode] = useState<"mock" | "openai">("mock");

async function sendMessage(event: FormEvent) {
  event.preventDefault();

  const message = value.trim();

  if (!message || loading) return;

  setMessages((current) => [
    ...current,
    {
      role: "user",
      content: message,
    },
  ]);

  setValue("");
  setLoading(true);

  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId,
      }),
    });

    // Read response as text first
    const responseText = await response.text();

    // Prevent "Unexpected end of JSON input"
    if (!responseText.trim()) {
      throw new Error(
        `Server returned an empty response (${response.status})`
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Invalid API response:", responseText);

      throw new Error(
        "Server returned an invalid response. Check the terminal."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          `Request failed with status ${response.status}`
      );
    }

    if (!data?.message) {
      throw new Error("Agent did not return a message.");
    }

    if (data.sessionId) {
      setSessionId(data.sessionId);
    }

    if (data.mode === "mock" || data.mode === "openai") {
      setAgentMode(data.mode);
    }

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: data.message,
      },
    ]);
  } catch (error) {
    console.error("Chat error:", error);

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Unable to process your request.",
      },
    ]);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="flex h-[680px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold">Customer Support</h2>
        <p className="text-sm text-slate-500">
          AI-assisted refund support
        </p>
        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {agentMode === "mock" ? "Demo Mode · Mock AI" : "Live Mode · OpenAI"}
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                message.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-sm text-slate-500">
            Agent is checking the request...
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="border-t border-slate-200 p-4">
        <div className="flex gap-3">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Example: I want a refund for ORD1001"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
          <button
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
