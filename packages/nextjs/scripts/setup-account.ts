require("dotenv").config({ path: ".env.local" });
const {
  AccountId,
  PrivateKey,
  TokenAssociateTransaction,
  TokenId,
  ContractExecuteTransaction,
  ContractId,
  ContractFunctionParameters,
  Hbar,
} = require("@hashgraph/sdk");
const { getHederaTestnetClient } = require("../lib/hedera/client");

const WHBAR_TOKEN_ID = "0.0.15058";
const SAUCE_TOKEN_ID = "0.0.1183558";
const WHBAR_CONTRACT_ID = "0.0.15057"; // the WHBAR contract itself (not the token)
const ROUTER_CONTRACT_ID = "0.0.19264";

async function main() {
  const client = getHederaTestnetClient();
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);

  console.log("Step 1: Associating WHBAR and SAUCE tokens...");
  const associateTx = await new TokenAssociateTransaction()
    .setAccountId(operatorId)
    .setTokenIds([TokenId.fromString(WHBAR_TOKEN_ID), TokenId.fromString(SAUCE_TOKEN_ID)])
    .execute(client);
  await associateTx.getReceipt(client);
  console.log("Association done.");

  console.log("Step 2: Wrapping 2 HBAR into WHBAR...");
  const wrapTx = await new ContractExecuteTransaction()
    .setContractId(ContractId.fromString(WHBAR_CONTRACT_ID))
    .setGas(150000)
    .setPayableAmount(new Hbar(2))
    .setFunction("deposit")
    .execute(client);
  await wrapTx.getReceipt(client);
  console.log("Wrap done.");

  console.log("All setup steps complete.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
