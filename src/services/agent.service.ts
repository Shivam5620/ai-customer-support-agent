import { runMockAgent } from "@/services/mock-agent.service";

type RunAgentInput = {
  message: string;
  sessionId?: string;
};

export async function runAgent({
  message,
  sessionId,
}: RunAgentInput) {
  const mode = process.env.AGENT_MODE || "mock";

  console.log("🤖 Agent mode:", mode);

  if (mode === "mock") {
    return runMockAgent(message, sessionId);
  }

  throw new Error(
    "OpenAI mode is not configured. Please use AGENT_MODE=mock."
  );
}