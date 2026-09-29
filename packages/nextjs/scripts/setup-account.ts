require("dotenv").config({ path: ".env.local" });
const {
  AccountId,
  TokenAssociateTransaction,
  TokenId,
} = require("@hashgraph/sdk");
const { getHederaTestnetClient } = require("../lib/hedera/client");

const SAUCE_TOKEN_ID = "0.0.1183558";

async function main() {
  const client = getHederaTestnetClient();
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);

  console.log("Associating account with SAUCE token...");
  const tx = await new TokenAssociateTransaction()
    .setAccountId(operatorId)
    .setTokenIds([TokenId.fromString(SAUCE_TOKEN_ID)])
    .execute(client);
  await tx.getReceipt(client);

  console.log("Done. Account can now receive SAUCE from a swap.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
