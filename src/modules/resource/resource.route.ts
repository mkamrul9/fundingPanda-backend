import { Router } from 'express';
import { ResourceController } from './resource.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ResourceValidation } from './resource.validation';
import checkAuth from '../../middlewares/checkAuth';

const router = Router();

router.post('/', checkAuth('SPONSOR'), validateRequest(ResourceValidation.createResourceZodSchema), ResourceController.createResource);
router.get('/', ResourceController.getAllResources);
router.delete('/:id', checkAuth('SPONSOR', 'ADMIN'), ResourceController.deleteResource);

export const ResourceRoutes = router;