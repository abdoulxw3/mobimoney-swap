export interface SwapQuote {
  dex: string;
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
}

export interface DexAdapter {
  name: string;
  getQuote(inputToken: string, outputToken: string, inputAmount: string): Promise<SwapQuote>;
  executeSwap(
    inputToken: string,
    outputToken: string,
    inputAmount: string,
    minOutputAmount: string,
    userAccountId: string
  ): Promise<{ txId: string; hashscanUrl: string }>;
}
