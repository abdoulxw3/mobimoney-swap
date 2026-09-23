require("dotenv").config({ path: ".env.local" });
const {
  AccountAllowanceApproveTransaction,
  AccountId,
  ContractId,
  TokenId,
} = require("@hashgraph/sdk");
const { getHederaTestnetClient } = require("../lib/hedera/client");

const WHBAR_TOKEN_ID = "0.0.15058";
const ROUTER_CONTRACT_ID = "0.0.19264";

async function main() {
  const client = getHederaTestnetClient();
  const ownerId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const spenderId = AccountId.fromString(ROUTER_CONTRACT_ID.replace(/^0\\.0\\./, "0.0."));

  console.log("Setting native HTS allowance for router...");

  const tx = await new AccountAllowanceApproveTransaction()
    .approveTokenAllowance(
      TokenId.fromString(WHBAR_TOKEN_ID),
      ownerId,
      AccountId.fromString(ROUTER_CONTRACT_ID),
      190000000
    )
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log("Status:", receipt.status.toString());
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
