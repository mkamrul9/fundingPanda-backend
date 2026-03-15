import { Router } from 'express';
import { DonationController } from './donation.controller';
import validateRequest from '../../middlewares/validateRequest';
import { DonationValidation } from './donation.validation';
import checkAuth from '@/src/middlewares/checkAuth';
import { UserRole } from '@prisma/client';

const router = Router();

router.post(
    '/create-donation',
    checkAuth(UserRole.SPONSOR),
    validateRequest(DonationValidation.createDonationZodSchema),
    DonationController.createDonation
);
router.get('/', DonationController.getAllDonations);
router.post(
    '/initiate-payment',
    checkAuth('SPONSOR'),
    validateRequest(DonationValidation.createDonationZodSchema),
    DonationController.initiatePayment
);


export const DonationRoutes = router;