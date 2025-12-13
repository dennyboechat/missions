"use client";

// Components
import { Container, Button, Text, TextField } from "@radix-ui/themes";
import { Space } from "../../Space";

// Hooks
import { useChat } from "@ai-sdk/react";

// Styles
import styles from "../styles/AiChat.module.css";

export const AiChat = ({ context }: { context: string }) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      initialMessages: [
        {
          id: "",
          content: context,
          role: "system",
        },
      ],
      api: "/api/chat",
    });

  return (
    <div>
      {messages
        .filter((m) => m.role !== "system")
        .map((m, index) => (
          <Container key={index} className={styles.message_panel}>
            {m.role === "user" ? "You: " : "AI: "}
            <Text>{m.content}</Text>
          </Container>
        ))}
      <Space />
      <form onSubmit={handleSubmit}>
        <TextField.Root
          placeholder="Ask something about this patient"
          value={input}
          onChange={handleInputChange}
        />
        <Space />
        <Button type="submit" disabled={isLoading}>
          {"Send"}
        </Button>
      </form>
    </div>
  );
};
