import { ErrorRequestHandler } from 'express';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong!';

    return res.status(statusCode).json({
        success: false,
        message,
        errorSources: err, // For development, we'll see the full error
    });
};

export default globalErrorHandler;