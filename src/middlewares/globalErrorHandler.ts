import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong!';
    let errorSources: any = err;

    // Check if the error is a Zod Validation Error
    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation Error';
        // Map over the issues to create a clean array of missing/invalid fields
        errorSources = err.issues.map((issue) => ({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        }));
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errorSources,
    });
};

export default globalErrorHandler;