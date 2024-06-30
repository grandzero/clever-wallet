import {
  Contract,
  cairo,
  uint256,
  CallData,
  BigNumberish,
  constants,
  RpcProvider,
} from "starknet";
import etherc20abi from "../abis/etherc20abi.json";

export enum OperationType {
  GetBalance,
  GetTokenBalance,
  SimulateTransaction,
  SendToken,
  SendEth,
  GetAddress,
  NormalChatOperation,
  SimulateRawTransaction,
  SimulateMyOperation
}

export enum ErrorTypes {
  CouldNotUnderstandPrompt,
  CouldNotFindDefault,
}

interface LLMResponse {
  operationType: OperationType;
  message: string;
  arguments: any;
}

const ETH_TOKEN_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const STRK_TOKEN_ADDRESS =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
function formatBalance(balance: string): string {
  const num = Number(balance) / 1e18;
  if (num < 1) {
    return num.toFixed(3);
  } else {
    return num.toFixed(1).replace(/\.0$/, "");
  }
}
async function getTokenBalance(
  wallet: any,
  tokenAddress: string
): Promise<string> {
  try {
    const contract = new Contract(
      etherc20abi.abi,
      tokenAddress,
      wallet.account.provider.provider
    );
    const balanceResponse = await contract.balanceOf(wallet.account.address);

    // Handle potential differences in response format
    let balance;
    if (Array.isArray(balanceResponse)) {
      balance = balanceResponse[0];
    } else if (
      typeof balanceResponse === "object" &&
      "balance" in balanceResponse
    ) {
      balance = balanceResponse.balance;
    } else {
      balance = balanceResponse;
    }
    console.log("Balance is : ", uint256.uint256ToBN(balance).toString());
    return formatBalance(uint256.uint256ToBN(balance).toString());
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw new Error(
      `Failed to get balance for token at address ${tokenAddress}`
    );
  }
}

export async function parseLLMResponse(response: string): Promise<LLMResponse> {
  try {
    console.log("Parsing LLM response:", response);
    const parsedResponse = JSON.parse(response);
    return parsedResponse as LLMResponse;
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
    throw new Error(ErrorTypes[ErrorTypes.CouldNotUnderstandPrompt]);
  }
}

export async function executeLLMResponse(
  response: LLMResponse,
  wallet: any
): Promise<string> {
  try {
    switch (response.operationType) {
      case OperationType.GetBalance:
        console.log("Getting balance");
        const ethBalance = await getTokenBalance(wallet, ETH_TOKEN_ADDRESS);
        let result = response.message.replace("[$balance]", ethBalance);
        return result;

      case OperationType.GetTokenBalance:
        // throw new Error("Invalid arguments for getting token balance");

        const tokenBal = await getTokenBalance(wallet, STRK_TOKEN_ADDRESS);
        if (response.message.includes("[$balance]"))
          return response.message.replace("[$balance]", tokenBal);

        return response.message + " Your accounts balance is : " + tokenBal;

      case OperationType.SimulateTransaction:
        if (
          !response.arguments ||
          !response.arguments.to ||
          !response.arguments.calldata
        ) {
          throw new Error("Invalid arguments for simulating transaction");
        }
        const simulationResult = await wallet.account.simulateTransaction({
          contractAddress: response.arguments.to,
          entrypoint: "execute",
          calldata: CallData.compile(response.arguments.calldata),
        });
        return `Transaction simulation result: ${JSON.stringify(
          simulationResult
        )}`;

      case OperationType.SendToken:
        console.log("Response is : ", response);
        if (
          !response.arguments ||
          !response.arguments.tokenAddress ||
          !response.arguments.to ||
          !response.arguments.amount
        ) {
          throw new Error("Invalid arguments for sending token");
        }
        const tokenContract = new Contract(
          etherc20abi.abi,
          response.arguments.tokenAddress,
          wallet.account
        );
        const amountUint256 = cairo.uint256(
          response.arguments.amount as BigNumberish
        );
        const tokenTransferResult = await tokenContract.transfer(
          response.arguments.to,
          amountUint256
        );
        return `Token transfer initiated: ${tokenTransferResult.transaction_hash}`;

      case OperationType.SendEth:
        if (
          !response.arguments ||
          !response.arguments.to ||
          !response.arguments.amount
        ) {
          throw new Error("Invalid arguments for sending ETH");
        }
        const amountEthUint256 = cairo.uint256(
          response.arguments.amount as BigNumberish
        );
        const transferResult = await wallet.account.execute({
          contractAddress: ETH_TOKEN_ADDRESS,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: response.arguments.to,
            amount: amountEthUint256,
          }),
        });
        return `ETH transfer initiated: ${transferResult.transaction_hash}`;
      case OperationType.GetAddress:
        return response.message.replace("[$address]", wallet.account.address);

        case OperationType.NormalChatOperation:
          return response.message;
  
        case OperationType.SimulateRawTransaction:
          // This will be handled by the frontend
          return "Your transaction is simulating. Soon you will receive a summary.";
  
        case OperationType.SimulateMyOperation:
          // This will be handled by the frontend
          return "Your operation is being simulated. Please wait for the results.";
  
      default:
        throw new Error(ErrorTypes[ErrorTypes.CouldNotFindDefault]);
    }
  } catch (error: any) {
    console.error("Error executing LLM response:", error);
    if (error.message.includes("User abort"))
      return "You have aborted the transaction.";
    return `An error occurred: ${error.message}`;
  }
}
