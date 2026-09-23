require("dotenv").config({ path: ".env.local" });
const {
  ContractExecuteTransaction,
  ContractId,
  ContractFunctionParameters,
  TokenId,
  AccountId,
  Hbar,
} = require("@hashgraph/sdk");
const { getHederaTestnetClient } = require("../lib/hedera/client");

const WHBAR_TOKEN_ID = "0.0.15058";
const SAUCE_TOKEN_ID = "0.0.1183558";
const ROUTER_CONTRACT_ID = "0.0.19264";

async function main() {
  const client = getHederaTestnetClient();

  const whbarEvm = TokenId.fromString(WHBAR_TOKEN_ID).toSolidityAddress();
  const sauceEvm = TokenId.fromString(SAUCE_TOKEN_ID).toSolidityAddress();
  const userEvm = "0x3917cc0cf10d6ecb718b33e4782e884d869e48ec";

  const deadline = Math.floor(Date.now() / 1000) + 300;
  const amountOutMin = "1"; // low bar for this first real test

  const params = new ContractFunctionParameters()
    .addUint256(amountOutMin)
    .addAddressArray([whbarEvm, sauceEvm])
    .addAddress(userEvm)
    .addUint256(deadline);

  console.log("Swapping 0.5 real HBAR for SAUCE...");

  const tx = new ContractExecuteTransaction()
    .setContractId(ContractId.fromString(ROUTER_CONTRACT_ID))
    .setGas(3000000)
    .setPayableAmount(new Hbar(0.5))
    .setFunction("swapExactETHForTokens", params);

  const submitted = await tx.execute(client);
  const receipt = await submitted.getReceipt(client);

  const txId = submitted.transactionId.toString();
  console.log("Status:", receipt.status.toString());
  console.log("Hashscan:", `https://hashscan.io/testnet/transaction/${txId}`);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
