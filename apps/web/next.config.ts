import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

// Security headers (CSP, X-Frame-Options, etc.) live in src/proxy.ts, not
// here — CSP now uses a per-request nonce, which next.config.ts's static
// headers() can't generate.

const nextConfig: NextConfig = {
  transpilePackages: ["@outfit-builder/ui", "@outfit-builder/contracts"],
  images: {
    // Seed data uses real, individually curated Unsplash photography.
    // picsum.photos hosts are kept for now since existing saved
    // outfits/E2E fixtures created before this change may still
    // reference them.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        // Virtual try-on results. Hostname per fashn.ai's docs — worth
        // re-confirming against a real response once a live
        // FASHN_API_KEY is available, rather than trusting docs alone.
        protocol: "https",
        hostname: "cdn.fashn.ai",
      },
    ],
  },
};

// Only wraps the config when ANALYZE=true — `ANALYZE=true pnpm --filter web
// build --webpack` (bundle-analyzer needs webpack; Turbopack's build
// doesn't emit the stats file it reads).
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
