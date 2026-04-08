import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';
import { toNodeHandler } from 'better-auth/node';
import { auth, allowedOriginsList, _normalize } from './lib/auth';
import 'dotenv/config';
import { DonationWebhook } from './modules/donation/donation.webhook';
import prisma from './lib/prisma';


const app: Application = express();
app.set('trust proxy', 1);

app.get('/', (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');
    const acceptsHtml = typeof req.headers.accept === 'string' && req.headers.accept.includes('text/html');

    if (frontendUrl && acceptsHtml) {
        return res.redirect(`${frontendUrl}/dashboard`);
    }

    return res.status(200).json({
        success: true,
        message: 'FundingPanda backend is live.',
        data: {
            name: 'FundingPanda API',
            version: 'v1',
            status: 'ok',
            docs: {
                health: '/api/v1/health',
                auth: '/api/auth',
                apiBase: '/api/v1',
            },
        },
    });
});

// Stripe Webhook needs the raw body
app.post(
    '/api/v1/donations/webhook',
    express.raw({ type: 'application/json' }),
    DonationWebhook.handleStripeWebhook
);

// Parsers + baseline security headers
app.use(express.json());
app.use(helmet());

const frontendUrl = process.env.FRONTEND_URL;
if (process.env.NODE_ENV === 'production' && !frontendUrl) {
    throw new Error('FRONTEND_URL is required in production');
}

const normalizeOrigin = (origin?: string) => (origin || '').replace(/\/+$/, '').trim().toLowerCase();

const corsAllowedOrigins = new Set(
    [
        frontendUrl,
        process.env.BETTER_AUTH_URL,
        ...allowedOriginsList,
        'https://funding-panda-frontend.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
    ]
        .filter((value): value is string => Boolean(value))
        .map((value) => normalizeOrigin(value))
);

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser calls (health checks, server-to-server)
        if (!origin) return callback(null, true);
        const normalized = normalizeOrigin(origin);
        if (corsAllowedOrigins.has(normalized)) return callback(null, true);

        // Allow Vercel preview deployments while keeping strict production origins.
        if (normalized.endsWith('.vercel.app')) return callback(null, true);

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true, // Required for cookies/sessions
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// BetterAuth Core Route 
const betterAuthBaseURL = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`;
app.use('/api/auth', async (req, res, next) => {
    const headersTyped = req.headers as Record<string, string | string[] | undefined>;
    try {
        if (req.method === 'POST' && req.path === '/sign-in/email') {
            const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

            if (email) {
                const user = await prisma.user.findFirst({
                    where: {
                        email: {
                            equals: email,
                            mode: 'insensitive',
                        },
                    },
                    select: {
                        isBanned: true,
                    },
                });

                if (user?.isBanned) {
                    return res.status(403).json({
                        success: false,
                        code: 'BANNED_USER',
                        message: 'Your account has been banned. Please contact support.',
                    });
                }
            }
        }
    } catch (error) {
        console.warn('Ban check skipped for sign-in due to runtime issue:', error);
    }

    if (process.env.DEBUG === 'true') {
        console.log('BetterAuth request headers:', {
            origin: headersTyped.origin,
            host: headersTyped.host,
            referer: headersTyped.referer,
        });
    }

    // Debug: show allowed origins and whether the incoming origin matches
    const incomingOrigin = Array.isArray(headersTyped.origin) ? headersTyped.origin[0] : headersTyped.origin;
    if (process.env.DEBUG === 'true') {
        console.log('BetterAuth allowedOrigins (normalized):', allowedOriginsList);
    }
    const normalizedIncoming = _normalize(incomingOrigin) ?? '';
    if (process.env.DEBUG === 'true') {
        console.log('Normalized incoming origin:', normalizedIncoming);
        console.log('Origin matches allowed list:', normalizedIncoming ? allowedOriginsList.includes(normalizedIncoming) : false);
    }
    // In development, if origin is unknown, override to backend base URL.
    // In production, allow Vercel preview origins by normalizing to configured frontend origin.
    const normalizedIncomingForRewrite = _normalize(incomingOrigin) ?? '';
    const isUnknownOrigin = normalizedIncomingForRewrite && !allowedOriginsList.includes(normalizedIncomingForRewrite);

    if (process.env.NODE_ENV !== 'production' && isUnknownOrigin) {
        if (process.env.DEBUG === 'true') {
            console.log('Overriding incoming origin for BetterAuth to:', betterAuthBaseURL);
        }
        headersTyped.origin = betterAuthBaseURL;
    }

    if (process.env.NODE_ENV === 'production' && isUnknownOrigin && normalizedIncomingForRewrite.endsWith('.vercel.app')) {
        const normalizedFrontend = _normalize(process.env.FRONTEND_URL) || 'https://funding-panda-frontend.vercel.app';
        if (process.env.DEBUG === 'true') {
            console.log('Normalizing Vercel preview origin for BetterAuth to:', normalizedFrontend);
        }
        headersTyped.origin = normalizedFrontend;
    }

    next();
}, (req, res, next) => {
    // For separate frontend/backend domains in production, auth cookies must be SameSite=None.
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = (name: string, value: number | string | readonly string[]) => {
        if (name.toLowerCase() === 'set-cookie') {
            const cookies = Array.isArray(value) ? [...value] : [String(value)];
            const rewritten = cookies.map((cookie) => {
                let nextCookie = cookie;

                if (/samesite=/i.test(nextCookie)) {
                    nextCookie = nextCookie.replace(/SameSite=Lax/gi, 'SameSite=None');
                    nextCookie = nextCookie.replace(/SameSite=Strict/gi, 'SameSite=None');
                } else {
                    nextCookie = `${nextCookie}; SameSite=None`;
                }

                if (!/;\s*Secure/i.test(nextCookie)) {
                    nextCookie = `${nextCookie}; Secure`;
                }

                return nextCookie;
            });

            return originalSetHeader(name, rewritten);
        }

        return originalSetHeader(name, value);
    };

    next();
}, toNodeHandler(auth));

// to test jwt and token
// app.get('/api/test-utils', (req, res) => {
//     const otp = generateNumericOTP();
//     const randomStr = generateRandomToken(16);

//     // Sign a dummy token
//     const jwtToken = signToken({ testId: '123' }, process.env.JWT_ACCESS_SECRET as string, '1h');

//     // Verify it immediately
//     const decoded = verifyToken(jwtToken, process.env.JWT_ACCESS_SECRET as string);

//     res.json({ success: true, otp, randomStr, jwtToken, decoded });
// });

// Application Routes
app.use('/api/v1', router);

// ... after routes
app.use(globalErrorHandler);

// Not Found Route Handler 
app.use(notFound);

export default app;