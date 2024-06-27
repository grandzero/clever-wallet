"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { connect, disconnect } from "starknetkit";

interface WalletContextType {
  wallet: any | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wallet, setWallet] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connectWallet = async () => {
    try {
      const { wallet } = await connect();
      if (wallet && wallet.isConnected) {
        setWallet(wallet);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      setWallet(null);
      setIsConnected(false);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      const { wallet } = await connect();
      if (wallet && wallet.isConnected) {
        setWallet(wallet);
        setIsConnected(true);
      }
    };
    checkConnection();
  }, []);

  return (
    <WalletContext.Provider
      value={{ wallet, isConnected, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};
