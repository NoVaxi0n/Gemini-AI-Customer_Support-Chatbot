import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    // Start the chat with the Gemini model
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessage(userMessage);
          const responseMessage = await result.response.text();

          // Stream the response letter by letter
          const encoder = new TextEncoder();
          for (let i = 0; i < responseMessage.length; i++) {
            controller.enqueue(encoder.encode(responseMessage[i]));
            await new Promise((resolve) => setTimeout(resolve, 50)); // Add a delay between letters
          }

          controller.close();
        } catch (error) {
          console.error("Error while streaming response:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
