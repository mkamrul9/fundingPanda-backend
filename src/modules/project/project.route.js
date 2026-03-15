import { Router } from 'express';
import { ProjectController } from './project.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ProjectValidation } from './project.validation';
import checkAuth from '../../middlewares/checkAuth';
import { UserRole } from '@prisma/client';
import { upload } from '../../middlewares/upload';
import parseFormData from '../../middlewares/parseFormData';

const router = Router();

router.post(
    '/create-project',
    checkAuth('STUDENT'),
    upload.fields([
        { name: 'pitchDoc', maxCount: 1 }, // Max 1 PDF
        { name: 'images', maxCount: 5 },   // Max 5 Images
    ]),
    parseFormData, // Parse the JSON data before Zod checks it
    validateRequest(ProjectValidation.createProjectZodSchema),
    ProjectController.createProject
);
router.get('/', ProjectController.getAllProjects);
router.get('/:id', ProjectController.getSingleProject);
router.put('/:id', checkAuth(UserRole.STUDENT), ProjectController.updateProject);
router.delete('/:id', checkAuth(UserRole.STUDENT, UserRole.ADMIN), ProjectController.deleteProject);


export const ProjectRoutes = router;