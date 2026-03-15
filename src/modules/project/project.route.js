import { Router } from 'express';
import { ProjectController } from './project.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ProjectValidation } from './project.validation';
import checkAuth from '../../middlewares/checkAuth';
import { UserRole } from '@prisma/client';

const router = Router();

router.post(
    '/create-project',
    checkAuth(UserRole.STUDENT), // Ensure the user is authenticated before allowing project creation
    validateRequest(ProjectValidation.createProjectZodSchema),
    ProjectController.createProject
);
router.get('/', ProjectController.getAllProjects);
router.get('/:id', ProjectController.getSingleProject);
router.put('/:id', checkAuth(UserRole.STUDENT), ProjectController.updateProject);
router.delete('/:id', checkAuth(UserRole.STUDENT, UserRole.ADMIN), ProjectController.deleteProject);


export const ProjectRoutes = router;