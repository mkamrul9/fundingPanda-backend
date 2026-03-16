import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UserService } from './user.service';



const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getAllUsersFromDB(req.query as Record<string, unknown>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Users retrieved successfully',
        data: result,
    });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await UserService.getMyProfileFromDB(userId);

    sendResponse(res, { statusCode: 200, success: true, message: 'Profile retrieved successfully', data: result });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await UserService.updateMyProfileInDB(userId, req.body);

    sendResponse(res, { statusCode: 200, success: true, message: 'Profile updated successfully', data: result });
});

const getTopSponsors = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getTopSponsors();
    sendResponse(res, { statusCode: 200, success: true, message: 'Top sponsors retrieved successfully', data: result });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await UserService.getSingleUserFromDB(id);
    sendResponse(res, { statusCode: 200, success: true, message: 'User retrieved successfully', data: result });
});

export const UserController = {
    getAllUsers,
    getMyProfile,
    updateMyProfile,
    getTopSponsors,
    getSingleUser,
};