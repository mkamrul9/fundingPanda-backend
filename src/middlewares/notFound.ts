import { NextFunction, Request, Response } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction) => {
    return res.status(404).json({
        success: false,
        message: 'API Route Not Found',
        errorSources: [
            {
                path: req.originalUrl,
                message: 'The requested route does not exist on this server.',
            },
        ],
    });
};

export default notFound;