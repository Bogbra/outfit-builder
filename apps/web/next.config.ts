import { ALLOWED_IMAGE_HOSTS } from "@outfit-builder/contracts";
import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

// Security headers (CSP, X-Frame-Options, etc.) live in src/proxy.ts, not
// here — CSP now uses a per-request nonce, which next.config.ts's static
// headers() can't generate.

const nextConfig: NextConfig = {
  transpilePackages: ["@outfit-builder/ui", "@outfit-builder/contracts"],
  images: {
    // Derived from the same allowlist product image URLs are validated
    // against (packages/contracts/src/domain/image-hosts.ts), so a host
    // can never be accepted by validation but fail to render here, or vice
    // versa. images.unsplash.com serves real, individually curated seed
    // photography; picsum.photos (+ the fastly.picsum.photos host it
    // redirects to) serves synthetic placeholder images used in API
    // contract test fixtures; cdn.fashn.ai serves virtual try-on results.
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
};

// Only wraps the config when ANALYZE=true — `ANALYZE=true pnpm --filter web
// build --webpack` (bundle-analyzer needs webpack; Turbopack's build
// doesn't emit the stats file it reads).
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
