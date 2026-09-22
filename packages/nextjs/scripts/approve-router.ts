require("dotenv").config({ path: ".env.local" });
const {
  ContractExecuteTransaction,
  ContractId,
  ContractFunctionParameters,
  TokenId,
} = require("@hashgraph/sdk");
const { getHederaTestnetClient } = require("../lib/hedera/client");

const WHBAR_TOKEN_ID = "0.0.15058";
const ROUTER_CONTRACT_ID = "0.0.19264";

async function main() {
  const client = getHederaTestnetClient();

  const routerEvm = ContractId.fromString(ROUTER_CONTRACT_ID).toSolidityAddress();

  console.log("Approving router to spend WHBAR...");

  const params = new ContractFunctionParameters()
    .addAddress(routerEvm)
    .addUint256("190000000");

  const tx = await new ContractExecuteTransaction()
    .setContractId(ContractId.fromString(WHBAR_TOKEN_ID))
    .setGas(800000)
    .setFunction("approve", params)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log("Status:", receipt.status.toString());
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
