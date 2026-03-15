import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ProjectService } from './project.service';

const createProject = catchAsync(async (req: Request, res: Response) => {
    // 1. Securely extract the ID from the authenticated user session
    const studentId = req.user?.id;

    // 2. Combine the body payload with the secure studentId
    const projectData = {
        ...req.body,
        studentId,
    };

    // 3. Send to the database service
    const result = await ProjectService.createProjectIntoDB(projectData);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Project created successfully',
        data: result,
    });
});

const getAllProjects = catchAsync(async (req: Request, res: Response) => {
    // Pass the query parameters from the request
    const result = await ProjectService.getAllProjectsFromDB(req.query);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Projects retrieved successfully',
        data: result.data, // Access the data array
        meta: result.meta, // Access the pagination metadata
    });
});


const getSingleProject = catchAsync(async (req: Request, res: Response) => {
    const result = await ProjectService.getSingleProjectFromDB(req.params.id as string);
    sendResponse(res, { statusCode: 200, success: true, message: 'Project retrieved successfully', data: result });
});

const updateProject = catchAsync(async (req: Request, res: Response) => {
    const result = await ProjectService.updateProjectInDB(req.params.id as string, req.body);
    sendResponse(res, { statusCode: 200, success: true, message: 'Project updated successfully', data: result });
});

const deleteProject = catchAsync(async (req: Request, res: Response) => {
    const result = await ProjectService.deleteProjectFromDB(req.params.id as string);
    sendResponse(res, { statusCode: 200, success: true, message: 'Project deleted successfully', data: result });
});


export const ProjectController = {
    createProject,
    getAllProjects,
    getSingleProject,
    updateProject,
    deleteProject
};