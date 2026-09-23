require("dotenv").config({ path: ".env.local" });
const { SaucerSwapAdapter } = require("../lib/dex/SaucerSwapAdapter");
const { TokenId, AccountId } = require("@hashgraph/sdk");

async function main() {
  const whbarEvm = TokenId.fromString("0.0.15058").toSolidityAddress();
  const sauceEvm = TokenId.fromString("0.0.1183558").toSolidityAddress();
  const userEvm = AccountId.fromString(process.env.HEDERA_OPERATOR_ID).toSolidityAddress();

  const adapter = new SaucerSwapAdapter();

  console.log("Getting fresh quote for 0.5 WHBAR...");
  const quote = await adapter.getQuote(whbarEvm, sauceEvm, "50000000");
  console.log("Quote:", quote);

  const minOutput = Math.floor(Number(quote.outputAmount) * 0.95).toString();
  console.log("Executing swap with minOutput:", minOutput);

  const result = await adapter.executeSwap(whbarEvm, sauceEvm, "50000000", minOutput, userEvm);
  console.log("Swap result:", result);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
