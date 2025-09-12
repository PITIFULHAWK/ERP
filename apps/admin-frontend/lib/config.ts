/**
 * Environment Configuration
 * Centralizes all environment variable handling
 */

export const config = {
    // API Configuration
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",

    // App Environment
    environment: process.env.NEXT_PUBLIC_APP_ENV || "development",

    // Helper methods
    isDevelopment: () => process.env.NEXT_PUBLIC_APP_ENV === "development",
    isProduction: () => process.env.NEXT_PUBLIC_APP_ENV === "production",

    // Get base URL without /api/v1 suffix
    getBaseUrl: () => {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        return apiUrl.replace("/api/v1", "");
    },

    // Validate required environment variables
    validate: () => {
        const required = ["NEXT_PUBLIC_API_URL"];
        const missing = required.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            console.warn(
                `Missing environment variables: ${missing.join(", ")}`
            );
            console.warn("Using default values for development");
        }

        return missing.length === 0;
    },
};

// Validate configuration on import
if (typeof window === "undefined") {
    // Only run validation on server side to avoid hydration issues
    config.validate();
}
