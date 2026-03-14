import { NextFunction, Request, Response } from 'express';
import { auth } from '../lib/auth';
import catchAsync from '../shared/catchAsync';

const checkAuth = (...requiredRoles: string[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        // 1. Get the session directly from BetterAuth using the request headers
        // Convert Node's IncomingHttpHeaders to a HeadersInit-compatible plain object
        const headersInit: Record<string, string> = {};
        for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headersInit[key] = value;
            else if (Array.isArray(value)) headersInit[key] = value.join(',');
            else if (value !== undefined) headersInit[key] = String(value);
        }

        const session = await auth.api.getSession({
            headers: headersInit,
        });

        // 2. If no valid session, throw an Unauthorized error
        if (!session || !session.user) {
            return res.status(401).json({
                success: false,
                message: 'You are not authorized to access this route.',
            });
        }

        // 3. If the route requires specific roles, check the user's role
        if (requiredRoles.length && !requiredRoles.includes(session.user.role as string)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have the required permissions.',
            });
        }

        // 4. Attach the user to the Express request object for use in controllers
        //@ts-ignore
        req.user = session.user;

        next();
    });
};

export default checkAuth;