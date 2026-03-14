
import { UserRole } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string | UserRole;
                university?: string | null;
                bio?: string | null;
                isVerified?: boolean;
            };
        }
    }
}