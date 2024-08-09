"use client";
import { useState } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      parts: [
        { text: "Hello, I'm Kenneth's assistant. How can I help you today?" },
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    // Add user's message to the conversation immediately
    const newUserMessages = [
      ...messages,
      { role: "user", parts: [{ text: input }] },
    ];
    setMessages(newUserMessages);

    // Clear the input field after sending the message
    setInput("");

    // Prevent multiple messages from being sent while streaming
    if (isStreaming) return;
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done, value;
      let accumulatedText = ""; // Initialize empty string to accumulate streamed text

      // Start with an empty assistant message in the conversation
      let newMessages = [
        ...newUserMessages,
        { role: "assistant", parts: [{ text: "" }] },
      ];
      setMessages(newMessages);

      while (!done) {
        ({ done, value } = await reader.read());
        if (value) {
          accumulatedText += decoder.decode(value, { stream: true });
          // Update the last message (assistant's response) dynamically
          setMessages((prev) => {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1] = {
              role: "assistant",
              parts: [{ text: accumulatedText }],
            };
            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error("Error during message streaming:", error);
    } finally {
      setIsStreaming(false); // Reset streaming state
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Stack
        direction={"column"}
        width="500px"
        height="700px"
        border="1px solid black"
        overflow={"auto"}
        maxHeight={"100%"}
        p={2}
        spacing={1}
      >
        <Stack
          flexGrow={1}
          overflow="auto"
          display="flex"
          flexDirection="column"
          spacing={2}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                }
                p={2}
                borderRadius={3}
                color="white"
              >
                {message.parts.map((part, partIndex) => (
                  <span key={partIndex}>{part.text}</span>
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
        <Box>
          <Stack direction={"row"} spacing={2} mt={2}>
            <TextField
              label="Type a message"
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button variant="contained" color="primary" onClick={sendMessage}>
              Send
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
