import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { HardwareService } from './hardware.service';

const createHardware = catchAsync(async (req: Request, res: Response) => {
    const lenderId = req.user?.id;

    const hardwareData = {
        ...req.body,
        lenderId,
    };

    const result = await HardwareService.createHardwareIntoDB(hardwareData);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Hardware listed successfully',
        data: result,
    });
});


// Update the getAllHardware function
const getAllHardware = catchAsync(async (req: Request, res: Response) => {
    const result = await HardwareService.getAllHardwareFromDB(req.query); // Pass req.query

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Available hardware retrieved successfully',
        meta: result.meta, // Add pagination meta
        data: result.data,
    });
});

const getSingleHardware = catchAsync(async (req: Request, res: Response) => {
    const result = await HardwareService.getSingleHardwareFromDB(req.params.id as string);
    sendResponse(res, { statusCode: 200, success: true, message: 'Hardware retrieved successfully', data: result });
});

const updateHardware = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await HardwareService.updateHardwareInDB(req.params.id as string, userId, req.body);
    sendResponse(res, { statusCode: 200, success: true, message: 'Hardware updated successfully', data: result });
});

const deleteHardware = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await HardwareService.deleteHardwareFromDB(req.params.id as string, userId);
    sendResponse(res, { statusCode: 200, success: true, message: 'Hardware deleted successfully', data: result });
});

export const HardwareController = {
    createHardware,
    getAllHardware,
    getSingleHardware,
    updateHardware,
    deleteHardware
};


