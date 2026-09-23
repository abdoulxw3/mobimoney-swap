import { DexAdapter, SwapQuote } from "./DexAdapter";
import {
  ContractId,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  HbarUnit,
} from "@hashgraph/sdk";
import { getHederaTestnetClient } from "../hedera/client";

// SaucerSwap testnet V1 router — contract ID 0.0.19264
const SAUCERSWAP_ROUTER_CONTRACT_ID = "0.0.19264";

// Hedera accounts using an ECDSA key have a real Keccak-256 EVM alias, distinct
// from the long-zero address derived from the account number. Contracts that
// check msg.sender / recipient identity need this real alias, not the long-zero
// form — fetch it from the mirror node rather than compute it locally.
async function getEvmAddressForAccount(hederaAccountId: string): Promise<string> {
  const res = await fetch(
    `https://testnet.mirrornode.hedera.com/api/v1/accounts/${hederaAccountId}`
  );
  const data = await res.json();
  if (!data.evm_address) {
    throw new Error(`No evm_address found for account ${hederaAccountId}`);
  }
  return data.evm_address;
}

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

  // Swaps native HBAR for an output token via SaucerSwap's router. Pass
  // inputToken as the WHBAR address (the router wraps internally), inputAmount
  // as tinybar, and userAccountId as the recipient's Hedera account id (0.0.X)
  // — this function resolves that to the real EVM alias before calling.
  async executeSwap(
    inputToken: string,
    outputToken: string,
    inputAmount: string,
    minOutputAmount: string,
    userAccountId: string
  ): Promise<{ txId: string; hashscanUrl: string }> {
    const client = getHederaTestnetClient();

    const userEvmAddress = await getEvmAddressForAccount(userAccountId);
    const deadline = Math.floor(Date.now() / 1000) + 300;

    const params = new ContractFunctionParameters()
      .addUint256(minOutputAmount)
      .addAddressArray([inputToken, outputToken])
      .addAddress(userEvmAddress)
      .addUint256(deadline);

    const hbarAmount = Hbar.fromTinybars(inputAmount);

    const tx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(SAUCERSWAP_ROUTER_CONTRACT_ID))
      .setGas(3000000)
      .setPayableAmount(hbarAmount)
      .setFunction("swapExactETHForTokens", params);

    const submitted = await tx.execute(client);
    const receipt = await submitted.getReceipt(client);

    if (receipt.status.toString() !== "SUCCESS") {
      throw new Error(`Swap failed with status: ${receipt.status.toString()}`);
    }

    const txId = submitted.transactionId.toString();
    const hashscanUrl = `https://hashscan.io/testnet/transaction/${txId}`;

    return { txId, hashscanUrl };
  }
}
