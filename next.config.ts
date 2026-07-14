import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Prisma (native query engine) out of the bundler — it loads its engine
  // from the filesystem at runtime, so it must stay an external server package.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
