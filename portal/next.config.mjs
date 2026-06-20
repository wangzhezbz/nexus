/** @type {import('next').NextConfig} */
const nextConfig = {
  // @nexus/* 以 TS 源码分发，需让 Next 转译
  transpilePackages: ["@nexus/ui", "@nexus/auth"],
};
export default nextConfig;
