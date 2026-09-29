# Agent instructions

Briefing for coding agents in this app (Cursor, Claude Code, Codex). Claude Code loads it through `CLAUDE.md`.

MobiMoney Swap is a Hedera dApp built on Scaffold-HBAR: Next.js App Router only, no Solidity framework. All Hedera interaction is via `@hashgraph/sdk` calls to SaucerSwap's already-deployed testnet router — there are no custom contracts, no Hardhat package, no Foundry package.

Package manager: yarn (see `package.json`).

## Layout

- `packages/nextjs` — the entire app. No `packages/hardhat` or `packages/foundry` exist in this project.
  - `lib/dex/DexAdapter.ts` — the swap interface (`getQuote`, `executeSwap`), designed so a second DEX can be added as another adapter later
  - `lib/dex/SaucerSwapAdapter.ts` — the real implementation, calling SaucerSwap's testnet router (`0.0.19264`) via `ContractCallQuery` (quotes) and `ContractExecuteTransaction` (swaps)
  - `lib/hedera/client.ts` — builds the Hedera testnet SDK client from `HEDERA_OPERATOR_ID`/`HEDERA_OPERATOR_KEY` in `.env.local`
  - `scripts/` — standalone debug/test scripts used during development (run via `npx tsx scripts/<name>.ts`), excluded from the Next.js build via `tsconfig.json`'s `exclude`

## Commands

```bash
cd packages/nextjs
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## A critical Hedera-specific gotcha

When calling a contract function that needs the caller's or recipient's identity as an `address` (e.g. the `to` parameter in a swap), **do not** compute it with `AccountId.fromString(id).toSolidityAddress()`. For accounts using an ECDSA key, that method returns the "long-zero" address (derived from the account number), not the account's real Keccak-256-derived EVM alias. Passing the long-zero address where the contract expects the real alias fails with `INVALID_ALIAS_KEY`.

The correct approach — already implemented in `SaucerSwapAdapter.executeSwap()` — is to fetch the real alias from the mirror node:

```typescript
const res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${hederaAccountId}`);
const { evm_address } = await res.json();
```

Use `evm_address`, not a locally-computed one, anywhere a contract call needs a Hedera account's EVM identity.

## Adding a second DEX adapter

`DexAdapter` is the interface both `getQuote` and `executeSwap` implement against. To add a second DEX (e.g. for best-price routing), implement the interface in a new file under `lib/dex/`, following `SaucerSwapAdapter.ts`'s pattern: resolve token/account IDs to real EVM addresses before any contract call, and use `ContractCallQuery` for reads, `ContractExecuteTransaction` for writes.

## Style

| Style | Use |
| --- | --- |
| `UpperCamelCase` | types, components |
| `lowerCamelCase` | variables, functions |
| `CONSTANT_CASE` | constants |

Prefer `type` over `interface` except where implementing a shared contract (like `DexAdapter`). No `T` prefix on types. Let TypeScript infer when it can. Comments should add information — especially anything Hedera-specific that isn't obvious from the code alone (see the alias gotcha above).
