import { Router } from 'express';
import { UserController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import checkAuth from '../../middlewares/checkAuth';

const router = Router();

router.post(
    '/create-user',
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
);
router.get('/', UserController.getAllUsers);
router.get(
    '/me',
    checkAuth('STUDENT', 'SPONSOR', 'ADMIN'), // Anyone logged in can view their profile
    UserController.getMyProfile
);
router.patch(
    '/me',
    checkAuth('STUDENT', 'SPONSOR', 'ADMIN'),
    UserController.updateMyProfile
);

export const UserRoutes = router;