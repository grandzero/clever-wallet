// wallet-connection.ts
import { connect } from "starknetkit";

export async function getWalletConnectionStatus(): Promise<any> {
  try {
    const { wallet } = await connect({ modalMode: "neverAsk" });
    return wallet && wallet.isConnected;
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    return false;
  }
}
