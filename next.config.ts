import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@xyflow/react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-switch",
      "@radix-ui/react-tooltip",
    ],
  },
};

export default nextConfig;
