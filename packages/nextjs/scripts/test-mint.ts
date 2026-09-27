require("dotenv").config({ path: ".env.local" });
const { mintReceiptToUser } = require("../lib/hedera/mint");

async function main() {
  console.log("Minting 10.00 MMR to self as a test...");
  const result = await mintReceiptToUser(process.env.HEDERA_OPERATOR_ID, 1000); // 1000 = 10.00 with 2 decimals
  console.log("Result:", result);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
