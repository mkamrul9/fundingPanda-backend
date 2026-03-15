import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import AppError from '../errors/AppError';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong!';
    let errorSources: any = err;

    // 0. Handle AppError explicitly (custom application errors)
    if (err instanceof AppError) {
        statusCode = err.statusCode || statusCode;
        message = err.message || message;
        errorSources = err;
        return res.status(statusCode).json({
            success: false,
            message,
            errorSources,
        });
    }

    // 1. Handle Zod Validation Errors
    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation Error';
        errorSources = err.issues.map((issue) => ({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        }));
    }

    // 2. Handle Prisma Known Request Errors (e.g., Unique constraint, Not found)
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            // Unique Constraint Failed
            statusCode = 409;
            message = 'Duplicate Entry';
            const target = (err.meta?.target as string[])?.join(', ') || 'field';
            errorSources = [{ path: target, message: `The ${target} is already in use.` }];
        } else if (err.code === 'P2025') {
            // Record Not Found
            statusCode = 404;
            message = 'Record Not Found';
            errorSources = [{ path: '', message: (err.meta?.cause as string) || 'The requested record does not exist in the database.' }];
        } else {
            // Fallback for other known Prisma errors
            statusCode = 400;
            message = 'Database Query Error';
            errorSources = [{ path: '', message: err.message }];
        }
    }

    // 3. Handle Prisma Validation Errors (e.g., passing a string where a number is expected in DB query)
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Database Validation Error';
        errorSources = [{ path: '', message: 'Invalid data provided for database query.' }];
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errorSources,
    });
};

export default globalErrorHandler;