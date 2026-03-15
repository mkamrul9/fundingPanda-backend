import { Router } from 'express';
import { DonationController } from './donation.controller';
import validateRequest from '../../middlewares/validateRequest';
import { DonationValidation } from './donation.validation';
import checkAuth from '@/src/middlewares/checkAuth';
import { UserRole } from '@prisma/client';

const router = Router();

router.post(
    '/initiate-payment',
    checkAuth('SPONSOR'),
    validateRequest(DonationValidation.createDonationZodSchema),
    DonationController.initiatePayment
);

router.get('/', DonationController.getAllDonations);

export const DonationRoutes = router;