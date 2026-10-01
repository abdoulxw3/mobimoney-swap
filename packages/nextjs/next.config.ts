import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: (config, { dev }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      // RainbowKit's bundled wagmi connectors statically import every wallet
      // connector regardless of which ones wagmiConnectors.tsx actually lists.
      // This app only offers MetaMask — Coinbase Wallet and WalletConnect are
      // dead code paths here, and both pull in nested dependencies with
      // version mismatches that break the build, so mark them external.
      ({ request }: { request?: string }, callback: (err: null, result?: string) => void) => {
        if (
          request &&
          (request.startsWith("@x402/") ||
            request.startsWith("@coinbase/cdp-sdk") ||
            request.startsWith("@coinbase/wallet-sdk") ||
            request.startsWith("@reown/") ||
            request.startsWith("@walletconnect/"))
        ) {
          return callback(null, `commonjs ${request}`);
        }
        callback(null);
      }
    );
    if (dev) {
      config.watchOptions = {
        followSymlinks: true,
      };
      config.snapshot = { ...(config.snapshot as object), managedPaths: [] };
    }
    return config;
  },
};

module.exports = nextConfig;
