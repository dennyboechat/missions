// Components
import { openai } from "@ai-sdk/openai";
import { streamText, convertToCoreMessages } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, context } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response("Invalid request", { status: 400 });
  }

  const coreMessages = convertToCoreMessages(messages);

  // Add context to system prompt if provided
  const systemPrompt = context
    ? `You are an assistant that analyzes health data. Here is the relevant context: ${context}`
    : "You are an assistant that analyzes health data.";

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: coreMessages,
  });

  return result.toTextStreamResponse();
}
