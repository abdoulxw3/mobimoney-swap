require("dotenv").config({ path: ".env.local" });
const { SaucerSwapAdapter } = require("../lib/dex/SaucerSwapAdapter");
const { TokenId } = require("@hashgraph/sdk");

async function main() {
  const whbarEvm = TokenId.fromString("0.0.15058").toSolidityAddress();
  const sauceEvm = TokenId.fromString("0.0.1183558").toSolidityAddress();

  const adapter = new SaucerSwapAdapter();

  console.log("Getting quote for 0.3 HBAR...");
  const quote = await adapter.getQuote(whbarEvm, sauceEvm, "30000000");
  console.log("Quote:", quote);

  const minOutput = Math.floor(Number(quote.outputAmount) * 0.95).toString();

  console.log("Executing swap via production adapter...");
  const result = await adapter.executeSwap(
    whbarEvm,
    sauceEvm,
    "30000000",
    minOutput,
    process.env.HEDERA_OPERATOR_ID
  );
  console.log("Result:", result);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
