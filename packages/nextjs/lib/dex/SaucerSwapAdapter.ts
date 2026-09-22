import { DexAdapter, SwapQuote } from "./DexAdapter";
import {
  ContractId,
  ContractCallQuery,
  ContractFunctionParameters,
} from "@hashgraph/sdk";
import { getHederaTestnetClient } from "../hedera/client";

// SaucerSwap testnet V1 router — contract ID 0.0.19264
const SAUCERSWAP_ROUTER_CONTRACT_ID = "0.0.19264";

export class SaucerSwapAdapter implements DexAdapter {
  name = "SaucerSwap";

  async getQuote(
    inputToken: string,
    outputToken: string,
    inputAmount: string
  ): Promise<SwapQuote> {
    const client = getHederaTestnetClient();

    const params = new ContractFunctionParameters()
      .addUint256(inputAmount)
      .addAddressArray([inputToken, outputToken]);

    const query = new ContractCallQuery()
      .setContractId(ContractId.fromString(SAUCERSWAP_ROUTER_CONTRACT_ID))
      .setGas(100000)
      .setFunction("getAmountsOut", params);

    const result = await query.execute(client);
    const amounts = result.getResult(["uint256[]"]);
    const outputAmount = amounts[0][1].toString();

    return {
      dex: this.name,
      inputToken,
      outputToken,
      inputAmount,
      outputAmount,
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
