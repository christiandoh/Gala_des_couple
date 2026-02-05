import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "1";
const basePath = isGitHubPages ? "/Gala_des_couple" : "";
const assetPrefix = isGitHubPages ? "/Gala_des_couple/" : "";

const nextConfig: NextConfig = {
  ...(isGitHubPages && { output: "export" }),
  ...(basePath && { basePath }),
  ...(assetPrefix && { assetPrefix }),
};

export default nextConfig;
