import prisma from '../../utils/prisma';
import { TDonation } from './donation.interface';

const createDonationIntoDB = async (payload: TDonation) => {
    // We use a Prisma Transaction array to execute operations sequentially
    // If any operation fails, the whole transaction rolls back.
    const [donation, updatedProject] = await prisma.$transaction([
        // 1. Create the donation record
        prisma.donation.create({
            data: payload,
        }),
        // 2. Update the project's raisedAmount
        prisma.project.update({
            where: { id: payload.projectId },
            data: {
                raisedAmount: {
                    increment: payload.amount,
                },
            },
        }),
    ]);

    return { donation, updatedProject };
};

const getAllDonationsFromDB = async () => {
    return await prisma.donation.findMany({
        include: {
            user: { select: { name: true, email: true } },
            project: { select: { title: true, goalAmount: true, raisedAmount: true } },
        },
    });
};

export const DonationService = {
    createDonationIntoDB,
    getAllDonationsFromDB,
};