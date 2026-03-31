import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

const validateRequest = (schema: ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const errorMessages = err.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation Failed',
                    errorSources: errorMessages,
                    errors: errorMessages,
                });
            }

            next(err);
        }
    };
};

export default validateRequest;