import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ProjectService } from './project.service';
import type { TProject } from './project.interface';
import { uploadToCloudinary } from '../../utils/cloudinary';

const createProject = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.id as string;
    let pitchDocUrl = null;
    const imageUrls: string[] = [];

    // 1. Handle File Uploads (if files were provided)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files) {
        // Upload PDF Document
        if (files.pitchDoc && files.pitchDoc.length > 0) {
            const docUpload = await uploadToCloudinary(files.pitchDoc[0].buffer, 'pitch-docs', 'raw');
            pitchDocUrl = docUpload.secure_url;
        }

        // Upload Images
        if (files.images && files.images.length > 0) {
            for (const file of files.images) {
                const imageUpload = await uploadToCloudinary(file.buffer, 'prototypes', 'image');
                imageUrls.push(imageUpload.secure_url);
            }
        }
    }

    // 2. Combine all data
    const projectData = {
        ...req.body,
        studentId,
        pitchDocUrl, // Add Cloudinary URL to DB
        images: imageUrls, // Add Cloudinary URLs to DB
    };

    // 3. Save to Database
    const result = await ProjectService.createProjectIntoDB(projectData);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Project and media created successfully',
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
    const userId = req.user?.id as string;
    const payload = req.body as Partial<TProject>;
    const result = await ProjectService.updateProjectInDB(req.params.id as string, userId, payload);
    sendResponse(res, { statusCode: 200, success: true, message: 'Project updated successfully', data: result });
});

const deleteProject = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await ProjectService.deleteProjectFromDB(req.params.id as string, userId);
    sendResponse(res, { statusCode: 200, success: true, message: 'Project deleted successfully', data: result });
});


export const ProjectController = {
    createProject,
    getAllProjects,
    getSingleProject,
    updateProject,
    deleteProject
};