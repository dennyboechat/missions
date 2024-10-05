// Components
import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-3.5-turbo"),
    system: "You are assistant analyses health data.",
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}
