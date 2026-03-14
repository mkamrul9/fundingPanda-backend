import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { UserRole } from "@prisma/client";
import prisma from "./prisma";

export const auth = betterAuth({
    // Public URL used by BetterAuth for callbacks/redirects and origin validation
    baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // We can toggle this later when email is set up
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: UserRole.STUDENT,
            },
            university: {
                type: "string",
                required: false,
            },
            bio: {
                type: "string",
                required: false,
            },
            isVerified: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
        }
    },

    plugins: [
        bearer(),
        // We will configure emailOTP fully in a later phase when we set up the email utility
    ],

    advanced: {
        useSecureCookies: false, // Set to true in production
    }
    ,
    // Allow the frontend origin and server base URL for BetterAuth origin checks
    // Include both FRONTEND_URL and BETTER_AUTH_URL (or derived baseURL)
    allowedOrigins: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`,
    ],
});