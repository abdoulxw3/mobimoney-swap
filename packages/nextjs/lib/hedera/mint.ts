import { AccountId, TokenId, TokenMintTransaction, TransferTransaction } from "@hashgraph/sdk";
import { getHederaTestnetClient } from "./client";

// MobiMoney Receipt token (MMR) — minted when a mock mobile-money deposit clears,
// then transferred to the user as proof-of-deposit before the swap executes.
const RECEIPT_TOKEN_ID = "0.0.10742316";

export async function mintReceiptToUser(
  userAccountId: string,
  amount: number,
): Promise<{ txId: string; hashscanUrl: string }> {
  const client = getHederaTestnetClient();

  if (!client.operatorAccountId) {
    throw new Error("Hedera client has no operator account configured");
  }
  const treasuryAccountId = client.operatorAccountId;

  const mintTx = await new TokenMintTransaction().setTokenId(TokenId.fromString(RECEIPT_TOKEN_ID)).setAmount(amount).execute(client);
  await mintTx.getReceipt(client);

  const transferTx = await new TransferTransaction()
    .addTokenTransfer(RECEIPT_TOKEN_ID, treasuryAccountId, -amount)
    .addTokenTransfer(RECEIPT_TOKEN_ID, AccountId.fromString(userAccountId), amount)
    .execute(client);

  const receipt = await transferTx.getReceipt(client);

  if (receipt.status.toString() !== "SUCCESS") {
    throw new Error(`Mint/transfer failed with status: ${receipt.status.toString()}`);
  }

  const txId = transferTx.transactionId.toString();
  const hashscanUrl = `https://hashscan.io/testnet/transaction/${txId}`;

  return { txId, hashscanUrl };
}
