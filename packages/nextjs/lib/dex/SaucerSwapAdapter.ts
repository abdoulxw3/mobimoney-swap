import { DexAdapter, SwapQuote } from "./DexAdapter";
import {
  ContractId,
  ContractCallQuery,
  ContractExecuteTransaction,
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
    const client = getHederaTestnetClient();

    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now

    const params = new ContractFunctionParameters()
      .addUint256(inputAmount)
      .addUint256(minOutputAmount)
      .addAddressArray([inputToken, outputToken])
      .addAddress(userAccountId)
      .addUint256(deadline);

    const tx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(SAUCERSWAP_ROUTER_CONTRACT_ID))
      .setGas(300000)
      .setFunction("swapExactTokensForTokens", params);

    const submitted = await tx.execute(client);
    const receipt = await submitted.getReceipt(client);

    const txId = submitted.transactionId.toString();
    const hashscanUrl = `https://hashscan.io/testnet/transaction/${txId}`;

    return { txId, hashscanUrl };
  }
}
