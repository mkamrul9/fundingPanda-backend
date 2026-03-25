import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { EngagementController } from './engagement.controller';
import { EngagementValidation } from './engagement.validation';

const router = Router();

router.post(
    '/newsletter/subscribe',
    validateRequest(EngagementValidation.subscribeNewsletterZodSchema),
    EngagementController.subscribeNewsletter
);

router.post(
    '/contact',
    validateRequest(EngagementValidation.submitContactZodSchema),
    EngagementController.submitContact
);

export const EngagementRoutes = router;
