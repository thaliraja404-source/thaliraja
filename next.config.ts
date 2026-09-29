import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler disabled: causes "Cannot read properties of null (reading 'useContext')"
  // during static prerender of /_global-error in Next.js 16.3.6
  // Re-enable when the upstream bug is fixed.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
