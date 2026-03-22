import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { DonationService } from './donation.service';

const createDonation = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const donationData = {
        ...req.body,
        userId,
    };

    const result = await DonationService.createDonationIntoDB(donationData);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Donation successful!',
        data: result,
    });
});


const getAllDonations = catchAsync(async (req: Request, res: Response) => {
    const result = await DonationService.getAllDonationsFromDB(req.query); // Pass req.query

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Donations retrieved successfully',
        meta: result.meta, // Add pagination meta
        data: result.data,
    });
});

const getMyDonations = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await DonationService.getMyDonationsFromDB(userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'My donations retrieved successfully',
        data: result,
    });
});

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const result = await DonationService.createCheckoutSession(userId, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payment session initiated successfully',
        data: result, // This contains the { paymentUrl }
    });
});

const confirmPaymentSession = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const { sessionId } = req.body;
    const result = await DonationService.confirmDonationFromCheckoutSession(userId, sessionId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.alreadyRecorded
            ? 'Donation was already recorded'
            : 'Donation recorded successfully from payment session',
        data: result,
    });
});

export const DonationController = {
    createDonation,
    getAllDonations,
    getMyDonations,
    initiatePayment,
    confirmPaymentSession,
};