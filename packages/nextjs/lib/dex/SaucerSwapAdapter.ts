import { DexAdapter, SwapQuote } from "./DexAdapter";
import { ContractId } from "@hashgraph/sdk";

// SaucerSwap testnet V1 router — contract ID 0.0.19264
const SAUCERSWAP_ROUTER_CONTRACT_ID = "0.0.19264";
const SAUCERSWAP_ROUTER_EVM_ADDRESS = ContractId.fromString(SAUCERSWAP_ROUTER_CONTRACT_ID).toSolidityAddress();

// WHBAR token ID 0.0.15058 (used when swapping HBAR itself)
const WHBAR_TOKEN_ID = "0.0.15058";

export class SaucerSwapAdapter implements DexAdapter {
  name = "SaucerSwap";

  async getQuote(
    inputToken: string,
    outputToken: string,
    inputAmount: string
  ): Promise<SwapQuote> {
    // TODO: call router getAmountsOut via ContractCallQuery
    return {
      dex: this.name,
      inputToken,
      outputToken,
      inputAmount,
      outputAmount: "0",
      priceImpact: 0,
    };
  }

  async executeSwap(
    inputToken: string,
    outputToken: string,
    inputAmount: string,
    minOutputAmount: string,
    userAccountId: string
  ): Promise<{ txId: string; hashscanUrl: string }> {
    throw new Error("Not yet implemented");
  }
}
