import { Router } from 'express';
import { DonationController } from './donation.controller';
import validateRequest from '../../middlewares/validateRequest';
import { DonationValidation } from './donation.validation';
import checkAuth from '../../middlewares/checkAuth';
import { UserRole } from '@prisma/client';

const router = Router();

router.post(
    '/create-donation',
    checkAuth(UserRole.SPONSOR),
    validateRequest(DonationValidation.createDonationZodSchema),
    DonationController.createDonation
);
router.get('/', DonationController.getAllDonations);
router.get('/me', checkAuth(UserRole.SPONSOR), DonationController.getMyDonations);
router.post(
    '/initiate-payment',
    checkAuth('SPONSOR'),
    validateRequest(DonationValidation.createDonationZodSchema),
    DonationController.initiatePayment
);
router.post(
    '/confirm-session',
    checkAuth(UserRole.SPONSOR),
    validateRequest(DonationValidation.confirmDonationSessionZodSchema),
    DonationController.confirmPaymentSession
);


export const DonationRoutes = router;