# MobiMoney Swap

Mobile money on-ramp with DEX routing on Hedera — built for the [Scaffold-HBAR Template Bounty](https://hedera.com/scaffold-hbar-template-bounty/).

## The problem this solves

To swap into a Hedera token today, you need to already own crypto — usually via a CEX detour that most African users don't have easy access to. MobiMoney Swap lets a user pay with **local mobile money** (M-Pesa, MTN MoMo, Airtel Money) and come out the other side with a token swap executed on-chain via [SaucerSwap](https://saucerswap.finance), Hedera's leading DEX. The user never leaves the app, never touches a third-party DEX interface, and never needs HBAR before they start.

## What's real vs. stubbed in this submission

- **Real, verified on-chain:** the SaucerSwap integration. `getQuote()` and `executeSwap()` in [`lib/dex/SaucerSwapAdapter.ts`](packages/nextjs/lib/dex/SaucerSwapAdapter.ts) make live calls to SaucerSwap's testnet router (`0.0.19264`) via `@hashgraph/sdk`. Two independent, real swaps have been executed and verified:
  - <https://hashscan.io/testnet/transaction/0.0.9267960@1790204427.645447493>
  - <https://hashscan.io/testnet/transaction/0.0.9267960@1790204611.765945169>
- **Real, verified on-chain:** an HTS receipt token, minted and transferred as the "deposit confirmed" step. `mintReceiptToUser()` in [`lib/hedera/mint.ts`](packages/nextjs/lib/hedera/mint.ts) mints MobiMoney Receipt (MMR, token `0.0.10742316`) and transfers it to the user via `TokenMintTransaction` + `TransferTransaction`. Verified:
  - <https://hashscan.io/testnet/transaction/0.0.9267960@1790502068.760129729>
- **Stubbed for this submission:** the mobile-money leg itself. Integrating a real payment provider's sandbox (Kotani Pay, Fonbnk) was too fragile a dependency for the bounty's build window, so the "deposit confirmed" trigger is mocked. The on-chain swap logic it triggers is fully real.

## Architecture

```
Mobile money deposit (mocked)
        │
        ▼
  HTS receipt mint  ──────►  SaucerSwap router (swapExactETHForTokens)
   (packages/nextjs)              (live testnet contract, real tx)
        │
        ▼
  User receives swapped token, sees Hashscan confirmation
```

A known Hedera-specific gotcha worth documenting for the next person who hits it: accounts using an **ECDSA key** have a real Keccak-256-derived EVM alias, distinct from the "long-zero" address you'd compute from the account number with `AccountId.toSolidityAddress()`. Passing the long-zero address as a swap recipient fails with `INVALID_ALIAS_KEY`. The fix — implemented in `SaucerSwapAdapter.executeSwap()` — is to fetch the real alias from the mirror node (`GET /accounts/{id}` → `evm_address`) before using it in any contract call.

## Setup

```bash
yarn install
```

Create `packages/nextjs/.env.local`:
```
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=your-testnet-private-key
```
Get a testnet account and key at [portal.hedera.com](https://portal.hedera.com).

```bash
yarn next:dev
```

Open <http://localhost:3000>.

## Scaffolding this template

This project uses **no Solidity framework** — all Hedera interaction is via `@hashgraph/sdk` calls to SaucerSwap's already-deployed router, not custom contracts. `template.json` declares `"solidityFramework": "none"`.

Scaffolding with the framework specified explicitly works and has been verified end-to-end:

```bash
npx create-scaffold-hbar@latest my-app --template abdoulxw3/mobimoney-swap --frontend nextjs-app --solidity-framework none --network testnet
```

**Known issue, reported to the Hedera team:** scaffolding with only `--template abdoulxw3/mobimoney-swap` (no other flags) causes the CLI to interactively select Foundry regardless of this template's declared `"solidityFramework": "none"`, then fail at `forge install` since this template doesn't include or need Foundry. If you hit this, use the explicit command above.

## Project layout

- **packages/nextjs** — Next.js App Router app. `lib/dex/` holds the DexAdapter interface and SaucerSwap implementation; `lib/hedera/` holds the Hedera client setup.

## Links

- [Scaffold HBAR docs](https://docs.hedera.com/solutions/tools/scaffold-hbar/index)
- [SaucerSwap docs](https://docs.saucerswap.finance)
- [Hedera Portal faucet](https://portal.hedera.com/faucet)
- [HashScan](https://hashscan.io/)
