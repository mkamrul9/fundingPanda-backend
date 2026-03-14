import { Router } from 'express';
import { ProjectController } from './project.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ProjectValidation } from './project.validation';

const router = Router();

router.post(
    '/create-project',
    validateRequest(ProjectValidation.createProjectZodSchema),
    ProjectController.createProject
);

router.get('/', ProjectController.getAllProjects);

export const ProjectRoutes = router;