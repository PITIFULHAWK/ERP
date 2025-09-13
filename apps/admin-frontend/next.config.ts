import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        // Get API base URL from environment variables
        const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        // Extract base URL without /api/v1 suffix for rewrites
        const baseUrl = apiBaseUrl.replace("/api/v1", "");

        return [
            {
                source: "/api/:path*",
                destination: `${baseUrl}/api/:path*`,
            },
        ];
    },

    // Ensure environment variables are available at build time
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    },

    // Enable experimental features if needed
    experimental: {
        // Add any experimental features here
    },
};

export default nextConfig;
