import { Router } from 'express';
import { AdminController } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import checkAuth from '../../middlewares/checkAuth';

const router = Router();

// Notice the strict checkAuth('ADMIN') protecting these routes
router.patch(
    '/users/:id/verify',
    checkAuth('ADMIN'),
    validateRequest(AdminValidation.verifyUserZodSchema),
    AdminController.verifyUser
);
router.patch(
    '/users/:id/ban',
    checkAuth('ADMIN'),
    validateRequest(AdminValidation.toggleUserBanZodSchema),
    AdminController.toggleUserBan
);
router.patch(
    '/projects/:id/status',
    checkAuth('ADMIN'),
    validateRequest(AdminValidation.updateProjectStatusZodSchema),
    AdminController.changeProjectStatus
);
router.get('/projects/moderation', checkAuth('ADMIN'), AdminController.getModerationQueue);
router.get('/analytics', checkAuth('ADMIN'), AdminController.getAnalytics);

export const AdminRoutes = router;