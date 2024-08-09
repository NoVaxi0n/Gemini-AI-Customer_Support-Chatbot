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

  const sendMessage = async () => {
    if (input.trim() === "") return; // Prevent sending empty messages

    // Add the user's message to the conversation
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", parts: [{ text: input }] },
    ]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await response.json();

    // Add the assistant's response to the conversation
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        parts: [{ text: data.message }],
      },
    ]);

    // Clear the input field
    setInput("");
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
                maxWidth="70%"
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
                if (e.key === "Enter") sendMessage();
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
