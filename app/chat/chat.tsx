"use client";
import React, { useState, useRef, useEffect } from "react";
import { connect } from "starknetkit";
import { useRouter } from "next/navigation";
import {
  PaperAirplaneIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/solid";
import { useWallet } from "@/lib/contexts/wallet-context";
import { executeLLMResponse, parseLLMResponse } from "@/lib/utils/llm-parser";
import Image from "next/image";
import {
  Contract,
  cairo,
  uint256,
  CallData,
  BigNumberish,
  constants,
  RpcProvider,
  Invocation,
  TransactionType,
} from "starknet";
interface Message {
  role: "user" | "assistant";
  content: string;
}
import etherc20abi from "../../lib/abis/etherc20abi.json";

const testTx = {
  jsonrpc: "2.0",
  method: "starknet_simulateTransactions",
  params: {
    block_id: {
      block_number: 651030,
    },
    transactions: [
      {
        type: "INVOKE",
        version: "0x3",
        sender_address:
          "0x06496c659adab5aeeb34d7767f697ad41abfec046584313fe54fc304804fb195",
        calldata: [
          "0x01",
          "0x1405ab78ab6ec90fba09e6116f373cda53b0ba557789a4578d8c1ec374ba0f",
          "0x0132bdf85fc8aa10ac3c22f02317f8f53d4b4f52235ed1eabb3a4cbbe08b5c41",
          "0x02",
          "0x4a",
          "0x01",
        ],
        signature: [],
        nonce: "0x3c1",
        tip: "0x0",
        paymaster_data: [],
        account_deployment_data: [],
        nonce_data_availability_mode: "L2",
        fee_data_availability_mode: "L2",
        resource_bounds: {
          l1_gas: {
            max_amount: "0x0",
            max_price_per_unit: "0x0",
          },
          l2_gas: {
            max_amount: "0x0",
            max_price_per_unit: "0x0",
          },
        },
      },
    ],
    simulation_flags: ["SKIP_VALIDATE"],
  },
  id: 1,
};
const suggestedActions = [
  "What's my balance?",
  "STARK token balance",
  "Simulate transaction",
  "Send 0.1 ETH",
];

const STRK_TOKEN_ADDRESS =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
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

    setVisibleMessages((prev) => [...prev, { role: "user", content: input }]);
    setVisibleMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Checking..." },
    ]);

    setInput("");

    const response = await sendMessageToBackend(input);

    setVisibleMessages((prev) => [
      ...prev.slice(0, -1),
      { role: "assistant", content: response },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <header className="flex justify-between items-center p-4 bg-gray-800">
        <Image
          onClick={async () => {
            // try {

            const amountUint256 = cairo.uint256("1000000000" as BigNumberish);

            let calldata = CallData.compile({
              recipient:
                "0x01729bf2e4c5b1f8150d4c73fca04981be5446092d10d0bd06ba66eab49fa71d",
              amount: amountUint256,
            });

            const invocation: Invocation = {
              contractAddress: STRK_TOKEN_ADDRESS,
              entrypoint: "transfer",
              calldata,
            };

            const simulationResult = await wallet.account.simulateTransaction(
              [
                {
                  type: "INVOKE_FUNCTION",
                  ...invocation,
                  // ...transactionsDetail,
                  // signature,
                },
              ],
              {
                blockIdentifier: "pending",
                skipValidate: true,
                skipExecute: true,
              }
            );

            console.log("Simulation result is : ", simulationResult);
            // } catch (error: any) {
            //   console.error(error);
            // }
          }}
          src="/cleverwhite.svg"
          alt="Clever Wallet Logo"
          width={52}
          height={52}
          className="rounded-full"
        />
        <h1 className="text-xl font-bold">Clever Wallet</h1>
        <span className="text-sm">
          {wallet?.selectedAddress
            ? `${wallet.selectedAddress.slice(
                0,
                5
              )}...${wallet.selectedAddress.slice(-4)}`
            : ""}
        </span>
      </header>

      <div className="flex-1 flex justify-center px-4 py-2">
        <div className="w-full max-w-4xl bg-gray-950 rounded-xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {visibleMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`relative max-w-[80%] px-4 py-2 rounded-xl ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {/* <div
                    style={{
                      transform:
                        msg.role === "user"
                          ? "rotate(60deg)"
                          : "rotate(-60deg)",
                    }}
                    className={`absolute -top-0.5 ${
                      msg.role === "user" ? "right-1" : "left-1"
                    } w-4 h-4 ${
                      msg.role === "user" ? "bg-blue-600" : "bg-gray-200"
                    } `}
                  ></div> */}
                  <div
                    style={{
                      top: -4.4,
                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", // Creates a triangle shape
                      transform:
                        msg.role === "user"
                          ? "rotate(65deg)"
                          : "rotate(-65deg)", // Adjust rotation if needed
                    }}
                    className={`absolute ${
                      msg.role === "user" ? "-right-2" : "-left-2"
                    } w-4 h-4 ${
                      msg.role === "user" ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  ></div>
                  <div className="relative z-10">{msg.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-gray-800">
            <div className="flex justify-center space-x-2 mb-4">
              {suggestedActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInput(action)}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-full transition duration-200"
                >
                  {action}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex items-center space-x-2 bg-gray-700 rounded-full">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 p-3 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-100 rounded-full"
                  placeholder="What would you like to do with your wallet?"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="p-2 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none disabled:opacity-50 mr-2"
                  disabled={isLoading}
                >
                  <PaperAirplaneIcon className="h-6 w-6" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="p-2 bg-gray-800">
        <p className="text-center text-xs text-gray-500">
          Clever wallet is currently in beta. Please do not use real funds.
        </p>
      </div>
    </div>
  );
}
