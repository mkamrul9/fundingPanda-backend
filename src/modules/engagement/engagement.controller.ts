import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { EngagementService } from './engagement.service';

const subscribeNewsletter = catchAsync(async (req: Request, res: Response) => {
    const result = await EngagementService.subscribeNewsletter(req.body.email);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Newsletter subscription confirmed',
        data: result,
    });
});

const submitContact = catchAsync(async (req: Request, res: Response) => {
    const result = await EngagementService.submitContact(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Message sent successfully',
        data: result,
    });
});

export const EngagementController = {
    subscribeNewsletter,
    submitContact,
};
