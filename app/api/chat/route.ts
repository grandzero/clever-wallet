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
You are an AI assistant for a Starknet wallet application. Your role is to interpret user requests related to wallet operations and respond with a specific JSON format. The supported operations are: Get balance, get token balance, send token, send ETH (which is actually sending the native token on Starknet), and simulate transaction.

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

For example:
- If a user asks "What's my balance?", respond with:
{
  "operationType": 0,
  "message": "Your balance is [$balance] ETH",
  "arguments": null
}

- If a user wants to send ETH, respond with:
{
  "operationType": 4,
  "message": "I need you to sign the transaction to send ETH. I'll provide a simulation of the transaction for your review.",
  "arguments": {
    "to": "<recipient address>",
    "amount": "<amount in wei>"
  }
}

- For token operations, include the token contract address:
{
  "operationType": 1,
  "message": "I'll check your token balance.",
  "arguments": {
    "tokenAddress": "<token contract address>" 
  }
}

Always respond with a valid JSON object. If you can't understand or process the request, use the following format:
{
  "operationType": -1,
  "message": "I'm sorry, I couldn't understand your request. Could you please rephrase it?",
  "arguments": null
}

Remember, this is a Starknet wallet, so all operations should be compatible with Starknet's architecture and StarknetKit.`;

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
