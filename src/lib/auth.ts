import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { UserRole } from "@prisma/client";
import prisma from "./prisma";
import { sendEmail } from "../utils/email";


export const auth = betterAuth({
    // Public URL used by BetterAuth for callbacks/redirects and origin validation
    baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
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
        // Add the emailOTP plugin here
        emailOTP({
            async sendVerificationOTP({ email, otp, type, user }) {
                if (type === "email-verification") {
                    // Send verification OTP regardless of whether the user record exists yet.
                    // Use user's name when available, otherwise fall back to the email local-part.
                    const nameFallback = user?.name || email.split('@')[0];

                    // Call our Nodemailer utility
                    await sendEmail({
                        to: email,
                        subject: "Verify your email for FundingPanda",
                        templateName: "otp",
                        templateData: {
                            name: nameFallback,
                            otp,
                        },
                    });
                }
            },
            expiresIn: 2 * 60, // OTP expires in 2 minutes
            otpLength: 6,
        })
    ],

    advanced: {
        useSecureCookies: false,
    }
    ,
    // Allow the frontend origin and server base URL for BetterAuth origin checks
    // Include both FRONTEND_URL and BETTER_AUTH_URL (or derived baseURL)
    allowedOrigins: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`,
    ],
});