# Demo / verification scripts

Standalone scripts used to build and verify the Hedera integrations in this project. Run with `npx tsx scripts/<name>.ts` from `packages/nextjs`, after setting up `.env.local` (see the root README).

- **test-quote.ts** — calls `SaucerSwapAdapter.getQuote()` for a real testnet quote (HBAR → SAUCE).
- **test-adapter-full.ts** — the full flow through the production `SaucerSwapAdapter` class: gets a quote, then calls `executeSwap()` for a real on-chain swap.
- **create-receipt-token.ts** — one-time setup: creates the MobiMoney Receipt (MMR) HTS token. Already run for this submission (token `0.0.10742316`); re-running would create a new token.
- **test-mint.ts** — calls `mintReceiptToUser()` to mint and transfer an MMR receipt token.
- **setup-account.ts** — associates a Hedera account with the SAUCE token, required before that account can receive it (HTS requires explicit association before holding any token).

These are excluded from the Next.js build (see `tsconfig.json`) since they're standalone dev/verification tools, not app code.
