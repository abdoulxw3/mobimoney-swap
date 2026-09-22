require("dotenv").config({ path: ".env.local" });
const { SaucerSwapAdapter } = require("../lib/dex/SaucerSwapAdapter");
const { TokenId } = require("@hashgraph/sdk");

async function main() {
  const whbarEvm = TokenId.fromString("0.0.15058").toSolidityAddress();
  const sauceEvm = TokenId.fromString("0.0.1183558").toSolidityAddress();

  const adapter = new SaucerSwapAdapter();
  const quote = await adapter.getQuote(whbarEvm, sauceEvm, "100000000"); // 1 HBAR in tinybar

  console.log("Quote result:", quote);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
