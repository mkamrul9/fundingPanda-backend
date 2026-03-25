import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AdminService } from './admin.service';
import type { TVerifyUser, TUpdateProjectStatus, TToggleUserBan } from './admin.interface';

const verifyUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body as TVerifyUser;
    const result = await AdminService.verifyUserInDB(id as string, payload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User verification status updated successfully',
        data: result,
    });
});

const toggleUserBan = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body as TToggleUserBan;
    const result = await AdminService.toggleUserBanInDB(id as string, payload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: payload.isBanned ? 'User banned successfully' : 'User unbanned successfully',
        data: result,
    });
});

const changeProjectStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body as TUpdateProjectStatus;
    const result = await AdminService.changeProjectStatusInDB(id as string, payload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Project status updated to ${result.status}`,
        data: result,
    });
});

const getAnalytics = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.getPlatformAnalytics();
    sendResponse(res, { statusCode: 200, success: true, message: 'Analytics retrieved', data: result });
});

const getModerationQueue = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.getModerationQueueFromDB();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Moderation queue retrieved',
        data: result,
    });
});

export const AdminController = {
    verifyUser,
    toggleUserBan,
    changeProjectStatus,
    getAnalytics,
    getModerationQueue,
};