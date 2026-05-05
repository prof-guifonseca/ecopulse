import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project so it doesn't infer
  // a stray ancestor lockfile (C:\Users\guilh\dev) and fail to resolve
  // tailwindcss / postcss plugins.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
