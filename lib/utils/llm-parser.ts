import {
  Contract,
  cairo,
  uint256,
  CallData,
  BigNumberish,
  RpcProvider,
} from "starknet";
import etherc20abi from "../abis/etherc20abi.json";
export enum OperationType {
  GetBalance,
  GetTokenBalance,
  SimulateTransaction,
  SendToken,
  SendEth,
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

async function getTokenBalance(
  wallet: any,
  tokenAddress: string
): Promise<string> {
  const provider = new RpcProvider({
    nodeUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_7",
  });
  const contract = new Contract(etherc20abi.abi, tokenAddress, provider);
  //   const contract = new Contract(etherc20abi.abi, tokenAddress, wallet.account);
  const balanceResponse = await contract.balanceOf(wallet.selectedAddress);
  return uint256.uint256ToBN(balanceResponse).toString();
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
  switch (response.operationType) {
    case OperationType.GetBalance:
      console.log("Entered here will get balance");
      const ethBalance = await getTokenBalance(wallet, ETH_TOKEN_ADDRESS);
      const strkBalance = await getTokenBalance(wallet, STRK_TOKEN_ADDRESS);
      return `Your balance is ${ethBalance} ETH and ${strkBalance} STRK`;

    case OperationType.GetTokenBalance:
      if (!response.arguments || !response.arguments.tokenAddress) {
        throw new Error("Invalid arguments for getting token balance");
      }
      const tokenBalance = await getTokenBalance(
        wallet,
        response.arguments.tokenAddress
      );
      return `Your token balance is ${tokenBalance}`;

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
      if (
        !response.arguments ||
        !response.arguments.tokenAddress ||
        !response.arguments.to ||
        !response.arguments.amount
      ) {
        throw new Error("Invalid arguments for sending token");
      }
      const tokenContract = new Contract(
        [],
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

    default:
      throw new Error(ErrorTypes[ErrorTypes.CouldNotFindDefault]);
  }
}
