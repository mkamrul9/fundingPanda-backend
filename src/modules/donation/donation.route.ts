import { Router } from 'express';
import { DonationController } from './donation.controller';
import validateRequest from '../../middlewares/validateRequest';
import { DonationValidation } from './donation.validation';

const router = Router();

router.post(
    '/create-donation',
    validateRequest(DonationValidation.createDonationZodSchema),
    DonationController.createDonation
);

router.get('/', DonationController.getAllDonations);

export const DonationRoutes = router;