import { Router } from 'express';
import { HardwareController } from './hardware.controller';
import validateRequest from '../../middlewares/validateRequest';
import { HardwareValidation } from './hardware.validation';

const router = Router();

router.post(
    '/list-hardware',
    validateRequest(HardwareValidation.createHardwareZodSchema),
    HardwareController.createHardware
);

router.get('/', HardwareController.getAllHardware);

export const HardwareRoutes = router;