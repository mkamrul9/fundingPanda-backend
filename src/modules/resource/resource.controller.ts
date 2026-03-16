import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ResourceService } from './resource.service';

const createResource = catchAsync(async (req: Request, res: Response) => {
    const lenderId = req.user?.id as string;
    const result = await ResourceService.createResourceIntoDB(req.body, lenderId);
    sendResponse(res, { statusCode: 201, success: true, message: 'Resource created successfully', data: result });
});

const getAllResources = catchAsync(async (req: Request, res: Response) => {
    const result = await ResourceService.getAllResourcesFromDB(req.query);
    sendResponse(res, { statusCode: 200, success: true, message: 'Resources retrieved', meta: result.meta, data: result.data });
});

const deleteResource = catchAsync(async (req: Request, res: Response) => {
    const lenderId = req.user?.id as string;
    const result = await ResourceService.deleteResourceFromDB(req.params.id as string, lenderId);
    sendResponse(res, { statusCode: 200, success: true, message: 'Resource deleted', data: result });
});

export const ResourceController = { createResource, getAllResources, deleteResource };