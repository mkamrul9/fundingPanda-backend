import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ProjectService } from './project.service';

const createProject = catchAsync(async (req: Request, res: Response) => {
    const result = await ProjectService.createProjectIntoDB(req.body);

    sendResponse(res, {
        statusCode: 201, // 201 Created
        success: true,
        message: 'Project created successfully',
        data: result,
    });
});

const getAllProjects = catchAsync(async (req: Request, res: Response) => {
    const result = await ProjectService.getAllProjectsFromDB();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Projects retrieved successfully',
        data: result,
    });
});

export const ProjectController = {
    createProject,
    getAllProjects,
};