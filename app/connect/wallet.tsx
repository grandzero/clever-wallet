"use client";
import { useEffect, useState } from "react";
import { connect } from "starknetkit";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/contexts/wallet-context";

export default function WalletConnectionScreen() {
  // const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  const { wallet, connectWallet } = useWallet();
  useEffect(() => {
    if (wallet?.isConnected) {
      router.push("/chat");
    }
  }, [wallet?.isConnected, router]);

  // const handleConnect = async () => {
  //   console.log("Connecting wallet...");
  //   try {
  //     const { wallet } = await connect();
  //     console.log(wallet);
  //     setIsConnected(true);
  //   } catch (error) {
  //     console.error("Failed to connect wallet:", error);
  //   }
  // };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold mb-8">
        Welcome to AI-Powered Wallet Assistant
      </h1>
      <button
        onClick={connectWallet}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Connect ArgentX Wallet
      </button>
    </div>
  );
}
