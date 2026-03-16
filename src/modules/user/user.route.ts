import { Router } from 'express';
import { UserController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import checkAuth from '../../middlewares/checkAuth';
import { UserRole } from '@prisma/client';

const router = Router();


router.get('/', checkAuth(UserRole.ADMIN), UserController.getAllUsers);
router.get(
    '/me',
    checkAuth(UserRole.STUDENT, UserRole.SPONSOR, UserRole.ADMIN), // Anyone logged in can view their profile
    UserController.getMyProfile
);
router.patch(
    '/me',
    checkAuth(UserRole.STUDENT, UserRole.SPONSOR, UserRole.ADMIN),
    UserController.updateMyProfile
);

// Public: list top sponsors
router.get('/top-sponsors', UserController.getTopSponsors);

// Public: get single user by id
router.get('/:id', UserController.getSingleUser);

export const UserRoutes = router;