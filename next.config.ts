import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Uploaded brand/partner art is user-supplied and unoptimized at the edge;
    // keep it byte-identical to what staff drop into public/uploads.
    unoptimized: true,
  },
};

export default nextConfig;
