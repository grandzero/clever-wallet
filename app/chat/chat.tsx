"use client";
import React, { useState, useRef, useEffect } from "react";
import { connect } from "starknetkit";
import { useRouter } from "next/navigation";
import { PaperAirplaneIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@/lib/contexts/wallet-context";
import { executeLLMResponse, parseLLMResponse } from "@/lib/utils/llm-parser";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestedActions = [
  "What is my account's balance?",
  "How much $STARK token do I have?",
  "Simulate transaction from clipboard",
  "Send 0.1 eth to my friend",
];

export default function ChatInterface() {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { wallet } = useWallet();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { wallet } = await connect({ modalMode: "neverAsk" });
      if (!wallet) {
        router.push("/connect");
      }
    })();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

  const sendMessageToBackend = async (userMessage: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          address: wallet?.account?.address,
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
      }
      let parsedResult = await parseLLMResponse(JSON.parse(result).response);
      try {
        let executionResult = await executeLLMResponse(parsedResult, wallet);
        return executionResult;
      } catch (error: any) {
        console.error("Error parsing response from backend:", error);
        return "Sorry, there was an error processing your request.";
      }
    } catch (error) {
      console.error("Error sending message to backend:", error);
      return "Sorry, there was an error processing your request.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    setVisibleMessages((prev) => [...prev, { role: "user", content: input }]);

    // Add temporary assistant message
    setVisibleMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Checking..." },
    ]);

    setInput("");

    const response = await sendMessageToBackend(input);

    // Update assistant message with the response
    setVisibleMessages((prev) => [
      ...prev.slice(0, -1),
      { role: "assistant", content: response },
    ]);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4">
        <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded flex items-center justify-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Chat
        </button>
        <div className="mt-4 space-y-2">
          {suggestedActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInput(action)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {visibleMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3/4 p-3 rounded-lg ${
                  msg.role === "user" ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 bg-gray-800">
            <div className="flex space-x-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
