import { Router } from 'express';
import { ResourceController } from './resource.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ResourceValidation } from './resource.validation';
import checkAuth from '../../middlewares/checkAuth';
import { UserRole } from '@prisma/client';

const router = Router();

router.post(
    '/list-resource',
    checkAuth(UserRole.SPONSOR),
    validateRequest(ResourceValidation.createResourceZodSchema),
    ResourceController.createResource
);
router.get('/', ResourceController.getAllResources);
router.get('/:id', ResourceController.getSingleResource);
router.patch(
    '/:id',
    checkAuth('SPONSOR'),
    ResourceController.updateResource
);
router.delete(
    '/:id',
    checkAuth('SPONSOR', 'ADMIN'), // Admins can also delete inappropriate resource listings
    ResourceController.deleteResource
);

export const ResourceRoutes = router;