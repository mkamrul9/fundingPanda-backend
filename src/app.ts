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


const app: Application = express();
app.set('trust proxy', 1);

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

const corsAllowedOrigins = new Set(
    [
        frontendUrl,
        process.env.BETTER_AUTH_URL,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
    ].filter((value): value is string => Boolean(value))
);

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser calls (health checks, server-to-server)
        if (!origin) return callback(null, true);
        if (corsAllowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true, // Required for cookies/sessions
}));

// BetterAuth Core Route 
const betterAuthBaseURL = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`;
app.use('/api/auth', (req, _res, next) => {
    const headersTyped = req.headers as Record<string, string | string[] | undefined>;

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
    // In development, if the incoming origin doesn't match our allowed list,
    // override it to the BetterAuth base URL so origin checks succeed.
    if (process.env.NODE_ENV !== 'production') {
        const normalizedIncoming = _normalize(incomingOrigin) ?? '';
        if (normalizedIncoming && !allowedOriginsList.includes(normalizedIncoming)) {
            if (process.env.DEBUG === 'true') {
                console.log('Overriding incoming origin for BetterAuth to:', betterAuthBaseURL);
            }
            headersTyped.origin = betterAuthBaseURL;
        }
    }

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