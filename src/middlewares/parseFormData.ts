import { NextFunction, Request, Response } from 'express';

const parseFormData = (req: Request, res: Response, next: NextFunction) => {
    // If the frontend sent a text field called "data" containing our JSON, parse it back into req.body
    if (req.body.data) {
        try {
            req.body = JSON.parse(req.body.data);
        } catch (error) {
            return res.status(400).json({ success: false, message: 'Invalid JSON format in form data' });
        }
    }
    next();
};

export default parseFormData;