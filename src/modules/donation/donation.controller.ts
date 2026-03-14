import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { DonationService } from './donation.service';

const createDonation = catchAsync(async (req: Request, res: Response) => {
    const result = await DonationService.createDonationIntoDB(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Donation successful!',
        data: result,
    });
});

const getAllDonations = catchAsync(async (req: Request, res: Response) => {
    const result = await DonationService.getAllDonationsFromDB();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Donations retrieved successfully',
        data: result,
    });
});

export const DonationController = {
    createDonation,
    getAllDonations,
};