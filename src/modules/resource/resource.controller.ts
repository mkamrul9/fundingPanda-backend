import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ResourceService } from './resource.service';

const createResource = catchAsync(async (req: Request, res: Response) => {
    const lenderId = req.user?.id;

    const resourceData = {
        ...req.body,
        lenderId,
    };

    const result = await ResourceService.createResourceIntoDB(resourceData);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Resource listed successfully',
        data: result,
    });
});


const getAllResources = catchAsync(async (req: Request, res: Response) => {
    const result = await ResourceService.getAllResourcesFromDB(req.query);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Resources retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getSingleResource = catchAsync(async (req: Request, res: Response) => {
    const result = await ResourceService.getSingleResourceFromDB(req.params.id as string);
    sendResponse(res, { statusCode: 200, success: true, message: 'Resource retrieved successfully', data: result });
});

const updateResource = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await ResourceService.updateResourceInDB(req.params.id as string, userId, req.body);
    sendResponse(res, { statusCode: 200, success: true, message: 'Resource updated successfully', data: result });
});

const deleteResource = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await ResourceService.deleteResourceFromDB(req.params.id as string, userId);
    sendResponse(res, { statusCode: 200, success: true, message: 'Resource deleted successfully', data: result });
});

export const ResourceController = {
    createResource,
    getAllResources,
    getSingleResource,
    updateResource,
    deleteResource,
};


