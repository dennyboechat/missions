"use client";

// Components
import { Container, Button, Text, TextField } from "@radix-ui/themes";
import { Space } from "../../Space";

// Hooks
import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";

// Styles
import styles from "../styles/AiChat.module.css";

type AiChatProps = { context: string };

function getTextContent(message: any): string {
  // Handle parts array structure
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p?.type === "text" && typeof p?.text === "string")
      .map((p: any) => p.text)
      .join("");
  }
  // Fallback to content string if available
  if (typeof message.content === "string") return message.content;
  return "";
}

export function AiChat({ context }: AiChatProps) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat();

  // Optional: if context changes, reset local input (keeps UI tidy)
  useEffect(() => {
    setInput("");
  }, [context]);

  const isLoading = status === "submitted" || status === "streaming";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Send message with role and parts, including context in the message
    sendMessage({
      role: "user" as const,
      parts: [
        { 
          type: "text" as const, 
          text: context ? `Context: ${context}\n\nQuestion: ${trimmed}` : trimmed 
        }
      ],
    });
    setInput("");
  }

  return (
    <div>
      {error ? (
        <Container className={styles.message_panel}>
          <Text>Something went wrong: {error.message}</Text>
        </Container>
      ) : null}

      {messages.map((m) => (
        <Container key={m.id} className={styles.message_panel}>
          <Text as="span" weight="bold">
            {m.role === "user" ? "You: " : "AI: "}
          </Text>
          <Text>{getTextContent(m)}</Text>
        </Container>
      ))}

      <Space />

      <form onSubmit={onSubmit}>
        <TextField.Root
          placeholder="Ask something about this patient"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />

        <Space />

        <Button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
