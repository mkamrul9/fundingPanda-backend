import { Router } from 'express';
import { HardwareController } from './hardware.controller';
import validateRequest from '../../middlewares/validateRequest';
import { HardwareValidation } from './hardware.validation';
import checkAuth from '@/src/middlewares/checkAuth';
import { UserRole } from '@prisma/client';

const router = Router();

router.post(
    '/list-hardware',
    checkAuth(UserRole.SPONSOR),
    validateRequest(HardwareValidation.createHardwareZodSchema),
    HardwareController.createHardware
);
router.get('/', HardwareController.getAllHardware);
router.get('/:id', HardwareController.getSingleHardware);
router.patch(
    '/:id',
    checkAuth('SPONSOR'),
    HardwareController.updateHardware
);
router.delete(
    '/:id',
    checkAuth('SPONSOR', 'ADMIN'), // Admins can also delete inappropriate hardware listings
    HardwareController.deleteHardware
);

export const HardwareRoutes = router;