require("dotenv").config({ path: ".env.local" });
const {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  AccountId,
  PrivateKey,
} = require("@hashgraph/sdk");
const { getHederaTestnetClient } = require("../lib/hedera/client");

async function main() {
  const client = getHederaTestnetClient();
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY);

  console.log("Creating MobiMoney Receipt token...");

  const tx = await new TokenCreateTransaction()
    .setTokenName("MobiMoney Receipt")
    .setTokenSymbol("MMR")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(0)
    .setSupplyType(TokenSupplyType.Infinite)
    .setTreasuryAccountId(operatorId)
    .setAdminKey(operatorKey.publicKey)
    .setSupplyKey(operatorKey.publicKey)
    .freezeWith(client)
    .sign(operatorKey);

  const submitted = await tx.execute(client);
  const receipt = await submitted.getReceipt(client);

  console.log("Status:", receipt.status.toString());
  console.log("Token ID:", receipt.tokenId.toString());
  console.log("Save this Token ID — you will need it in lib/hedera/mint.ts");
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
