import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { UserRole } from "@prisma/client";
import prisma from "./prisma";
import { sendEmail } from "../utils/email";

// Build a normalized allowed origins list to avoid common dev mismatches
export const _frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
export const _betterAuth = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`;
export const _normalize = (u?: string) => u ? u.replace(/\/+$/, '') : u;
const frontendUrlRaw = process.env.FRONTEND_URL || 'http://localhost:3000';
const useCrossSiteCookies = process.env.NODE_ENV === 'production' || frontendUrlRaw.startsWith('https://');
const _extraTrustedOrigins = (process.env.TRUSTED_ORIGINS || '')
    .split(',')
    .map((v) => _normalize(v.trim()))
    .filter((v): v is string => Boolean(v));
export const allowedOriginsList = Array.from(new Set([
    _normalize(_frontend),
    _normalize(_betterAuth),
    'https://funding-panda-frontend.vercel.app',
    ..._extraTrustedOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'null', // some dev clients use 'null' as origin
].filter((v): v is string => Boolean(v))));

const devTrustedOrigins = [
    _normalize(_frontend),
    _normalize(_betterAuth),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:5000',
].filter((v): v is string => Boolean(v));

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const facebookClientId = process.env.FACEBOOK_CLIENT_ID?.trim();
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET?.trim();
const githubClientId = process.env.GITHUB_CLIENT_ID?.trim();
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

if (process.env.DEBUG === 'true') {
    console.log('BetterAuth allowedOrigins:', allowedOriginsList);
}


export const auth = betterAuth({
    // Public URL used by BetterAuth for callbacks/redirects and origin validation
    baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
        async sendResetPassword(data, request) {
            // Avoid blocking API response on email transport latency/failure.
            void sendEmail({
                to: data.user.email,
                subject: "Reset your FundingPanda Password",
                templateName: "reset-password",
                templateData: {
                    url: data.url, // BetterAuth generates this secure, single-use URL automatically!
                },
            }).catch((error) => {
                console.error('Reset password email dispatch failed:', error);
            });
        },
    },

    socialProviders: {
        ...(googleClientId && googleClientSecret
            ? {
                google: {
                    clientId: googleClientId,
                    clientSecret: googleClientSecret,
                },
            }
            : {}),
        ...(facebookClientId && facebookClientSecret
            ? {
                facebook: {
                    clientId: facebookClientId,
                    clientSecret: facebookClientSecret,
                },
            }
            : {}),
        ...(githubClientId && githubClientSecret
            ? {
                github: {
                    clientId: githubClientId,
                    clientSecret: githubClientSecret,
                },
            }
            : {}),
    },

    // Email verification hook used by BetterAuth for email/password flows
    emailVerification: {
        async sendVerificationEmail({ user, url, token }, req) {
            const nameFallback = user?.name || user.email.split('@')[0];
            const loginCallbackUrl = `${_normalize(_frontend) || 'http://localhost:3000'}/login`;
            let verificationUrl = url;

            try {
                const parsed = new URL(url);
                const existingCallbackUrl = parsed.searchParams.get('callbackURL');
                if (!existingCallbackUrl) {
                    parsed.searchParams.set('callbackURL', loginCallbackUrl);
                } else if (existingCallbackUrl.startsWith('/')) {
                    parsed.searchParams.set('callbackURL', `${_normalize(_frontend) || 'http://localhost:3000'}${existingCallbackUrl}`);
                }
                verificationUrl = parsed.toString();
            } catch {
                // Keep BetterAuth generated URL if parsing fails.
                verificationUrl = url;
            }

            if (process.env.DEBUG === 'true') {
                console.log('Dispatching verification email', {
                    email: user.email,
                    hasToken: Boolean(token),
                    verificationUrl,
                });
            }

            // Never block signup on email transport latency.
            void sendEmail({
                to: user.email,
                subject: 'Verify your email for FundingPanda',
                templateName: 'verification',
                templateData: {
                    name: nameFallback,
                    url: verificationUrl,
                    token,
                },
            })
                .then(() => {
                    if (process.env.DEBUG === 'true') {
                        console.log('Verification email dispatched successfully for', user.email);
                    }
                })
                .catch((error) => {
                    console.error('Verification email dispatch failed:', error);
                });
        },
        sendOnSignUp: true,
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
            async sendVerificationOTP(data: any, ctx: any) {
                const { email, otp, type } = data || {};
                if (type === "email-verification") {
                    let user: any | undefined;
                    try {
                        user = await ctx?.context?.internalAdapter?.findUserByEmail?.(email);
                    } catch (e) {
                        user = undefined;
                    }

                    // Use user's name when available, otherwise fall back to the email local-part.
                    const nameFallback = user?.name || (email ? email.split('@')[0] : '');

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
        useSecureCookies: useCrossSiteCookies,
        // In dev, relax origin and CSRF checks to unblock testing
        disableOriginCheck: process.env.NODE_ENV !== 'production',
        disableCSRFCheck: process.env.NODE_ENV !== 'production',
    },
    // Ensure browser accepts auth cookies for cross-site requests (Vercel -> Render).
    defaultCookieAttributes: {
        secure: useCrossSiteCookies,
        sameSite: useCrossSiteCookies ? 'none' : 'lax',
        path: '/',
        httpOnly: true,
    },
    cookies: {
        sessionToken: {
            attributes: {
                secure: useCrossSiteCookies,
                sameSite: useCrossSiteCookies ? 'none' : 'lax',
                path: '/',
                httpOnly: true,
            },
        },
    },
    // BetterAuth uses `trustedOrigins` for origin validation
    trustedOrigins: process.env.NODE_ENV !== 'production'
        ? devTrustedOrigins
        : allowedOriginsList,
});