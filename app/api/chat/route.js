import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req) {
  try {
    const data = await req.json(); // Properly parse the JSON body
    const userMessage = data.prompt; // Assuming the user's message is sent in the 'prompt' field
    console.log(data);

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "system" }],
        },
        {
          role: "model",
          parts: [{ text: "system" }],
        },
      ],
      stream: true,
    });

    // Send the user's message to the chat model
    let result = await chat.sendMessage(userMessage);
    const responseMessage = await result.response.text();

    console.log(responseMessage);

    return NextResponse.json({ message: responseMessage }, { status: 200 });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
