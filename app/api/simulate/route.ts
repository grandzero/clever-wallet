import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { simulationResult, operationType } = await req.json();

    if (!simulationResult || !operationType) {
      return NextResponse.json(
        { error: "Simulation result and operation type are required" },
        { status: 400 }
      );
    }

    console.log("Received simulation result:", simulationResult);
    console.log("Operation type:", operationType);

    let systemPrompt;

    if (operationType === "SimulateRawTransaction") {
      systemPrompt = `You are an AI assistant analyzing a Starknet transaction simulation. The simulation result is provided to you. Your task is to explain the transaction details, its potential effects, and any notable aspects in a clear, concise manner. Focus on key information such as the type of operation, involved addresses, token transfers (if any), and potential risks or benefits. Respond in a JSON format with an "operationType" of 7 and a detailed "message".`;
    } else if (operationType === "SimulateMyOperation") {
      systemPrompt = `You are an AI assistant analyzing a simulated Starknet wallet operation. The simulation result of a token transfer is provided to you. Your task is to explain the operation details, its effects, and any notable aspects in a clear, concise manner. Focus on key information such as the amount transferred, the recipient address, any fees involved, and potential confirmations needed. Respond in a JSON format with an "operationType" of 8 and a detailed "message".`;
    } else {
      return NextResponse.json(
        { error: "Invalid operation type" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(simulationResult) },
      ],
      temperature: 0.7,
    });

    const aiResponse = response.choices[0].message.content;
    console.log("AI Response:", aiResponse);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}