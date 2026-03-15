import express, { Application } from 'express';
import cors from 'cors';
import router from './routes';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import 'dotenv/config';
import { DonationWebhook } from './modules/donation/donation.webhook';


const app: Application = express();

// Stripe Webhook needs the raw body
app.post(
    '/api/v1/donations/webhook',
    express.raw({ type: 'application/json' }),
    DonationWebhook.handleStripeWebhook
);

// Parsers
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Required for cookies/sessions
}));

// BetterAuth Core Route 
const betterAuthBaseURL = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`;
app.use('/api/auth', (req, _res, next) => {
    console.log('BetterAuth request headers:', {
        origin: req.headers.origin,
        host: req.headers.host,
        referer: req.headers.referer,
    });

    // Normalize Origin to the configured BetterAuth baseURL during local development
    // This avoids 'Invalid origin' errors when frontend origin validation is strict
    // Do not reassign `req.headers` (keeps types intact) — set the origin property on a typed view.
    const headersTyped = req.headers as Record<string, string | string[] | undefined>;
    headersTyped.origin = betterAuthBaseURL;

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