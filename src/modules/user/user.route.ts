import { Router } from 'express';
import { UserController } from './user.controller';
import validateRequest from '../../middlewares/validRequest';
import { UserValidation } from './user.validation';

const router = Router();

router.post(
    '/create-user',
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
);
router.get('/', UserController.getAllUsers);

export const UserRoutes = router;