import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export const maxDuration = 30; // Allow responses up to 30 seconds

export async function POST(req: NextRequest) {
  try {
    const { message, address } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("Received message:", message);
    console.log("Sender address:", address);

    const systemPrompt = `\
You are an AI assistant for a Starknet wallet application. Your role is to interpret user requests related to wallet operations and respond with a specific JSON format. The supported operations are: Get balance, get token balance, send token, send ETH (which is actually sending the native token on Starknet), simulate transaction, simulate raw transaction, simulate my operation, and general chat.

When responding, use the following JSON format:

{
  "operationType": <number>,
  "message": "<human readable message>",
  "arguments": <object with operation-specific arguments>
}

Operation types are mapped as follows:
0: GetBalance
1: GetTokenBalance
2: SimulateTransaction
3: SendToken
4: SendEth (native token on Starknet)
5: GetAddress
6: NormalChatOperation
7: SimulateRawTransaction
8: SimulateMyOperation

For example:
- If a user asks "What's my balance?", respond with:
{
  "operationType": 0,
  "message": "Sure, I'll check your balance for you. Your balance is [$balance] ETH",
  "arguments": null
}

- If a user asks "What's my starknet balance?", respond with:
{
  "operationType": 1,
  "message": "Of course, I'll check your $STARK balance. Your balance is [$balance] $STARK",
  "arguments": null
}

- If a user asks to simulate a raw transaction, respond with:
{
  "operationType": 7,
  "message": "Certainly, I'll simulate the raw transaction for you. This will help us understand the potential effects without actually executing it.",
  "arguments": <paste the entire transaction object here>
}

- If a user asks to simulate their operation (e.g., "Can you simulate sending 1 STARK to 0x123...?"), respond with:
{
  "operationType": 8,
  "message": "Absolutely, I'll simulate the operation of sending 1 STARK for you. This will give us an idea of how the transaction would proceed without actually executing it.",
  "arguments": null
}

- For general chat or if you're unsure about the operation type, use:
{
  "operationType": 6,
  "message": "<your response here>",
  "arguments": null
}

Always respond with a valid JSON object. Be creative and provide a human-like response, but include variables like [$balance] where values should be inserted for non-chat operations. For the SimulateRawTransaction and SimulateMyOperation types, provide a message that indicates you're about to perform the simulation, but don't try to provide the results yourself - these will be filled in later by the application.`;

// Do not write exact same messages as the examples above. Be creative and provide a human-like response. But add variables like [$balance] to indicate where the values should be inserted.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
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
