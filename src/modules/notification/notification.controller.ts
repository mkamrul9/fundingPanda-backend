import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { NotificationService } from './notification.service';

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const role = req.user?.role as string;

    const result = await NotificationService.getMyNotificationsFromDB(userId, role);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Notifications retrieved successfully',
        data: result,
    });
});

const markAllNotificationsRead = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const role = req.user?.role as string;
    const markedCount = await NotificationService.markAllNotificationsReadInDB(userId, role);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Notifications marked as read',
        data: { markedCount },
    });
});

export const NotificationController = {
    getMyNotifications,
    markAllNotificationsRead,
};
