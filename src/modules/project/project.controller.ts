import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ProjectService } from './project.service';
import type { TProject } from './project.interface';
import { uploadToCloudinary, deleteFromCloudinary, extractCloudinaryPublicId } from '../../utils/cloudinary';

const createProject = catchAsync(async (req: Request, res: Response) => {
    const studentId = req.user?.id as string;
    let pitchDocUrl = null;
    const imageUrls: string[] = [];

    // 1. Handle File Uploads (if files were provided)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files) {
        // Upload PDF Document
        if (files.pitchDoc && files.pitchDoc.length > 0) {
            const file = files.pitchDoc[0];
            const docUpload = await uploadToCloudinary(file.buffer, 'pitch-docs', 'raw', file.originalname); // Passed originalname!
            pitchDocUrl = docUpload.secure_url;
        }

        // Upload Images
        if (files.images && files.images.length > 0) {
            for (const file of files.images) {
                const imageUpload = await uploadToCloudinary(file.buffer, 'prototypes', 'image', file.originalname);
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
    const projectId = req.params.id;
    const userId = req.user?.id as string;

    // 1. Fetch the existing project to get the old URLs
    const existingProject = await ProjectService.getSingleProjectFromDB(projectId as string);

    let newPitchDocUrl = existingProject.pitchDocUrl;
    const newImageUrls = [...existingProject.images]; // Keep existing images by default

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // 2. Handle new PDF Upload
    if (files && files.pitchDoc && files.pitchDoc.length > 0) {
        // Delete the old one from Cloudinary if it exists
        if (existingProject.pitchDocUrl) {
            const publicId = extractCloudinaryPublicId(existingProject.pitchDocUrl, 'raw');
            if (publicId) await deleteFromCloudinary(publicId, 'raw');
        }
        // Upload the new one
        const file = files.pitchDoc[0];
        const docUpload = await uploadToCloudinary(file.buffer, 'pitch-docs', 'raw', file.originalname);
        newPitchDocUrl = docUpload.secure_url;
    }

    // 3. Handle new Image Uploads (Assuming a total replacement for simplicity)
    if (files && files.images && files.images.length > 0) {
        // Delete all old images from Cloudinary
        for (const oldImageUrl of existingProject.images) {
            const publicId = extractCloudinaryPublicId(oldImageUrl, 'image');
            if (publicId) await deleteFromCloudinary(publicId, 'image');
        }
        // Clear the array and upload the new ones
        newImageUrls.length = 0;
        for (const file of files.images) {
            const imageUpload = await uploadToCloudinary(file.buffer, 'prototypes', 'image');
            newImageUrls.push(imageUpload.secure_url);
        }
    }

    // 4. Combine data and update DB
    const updateData = {
        ...req.body,
        pitchDocUrl: newPitchDocUrl,
        images: newImageUrls,
    };

    const result = await ProjectService.updateProjectInDB(projectId as string, userId, updateData);

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