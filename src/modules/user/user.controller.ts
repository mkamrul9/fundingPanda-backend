import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UserService } from './user.service';
import { get } from 'node:http';

const createUser = async (req: Request, res: Response) => {
    try {
        const result = await UserService.createUserIntoDB(req.body);
        res.status(200).json({
            success: true,
            message: 'User created successfully',
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || 'Something went wrong',
        });
    }
};

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllUsersFromDB();
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || 'Something went wrong',
        });
    }
};

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

export const UserController = {
    createUser,
    getAllUsers,
    getMyProfile,
    updateMyProfile
};