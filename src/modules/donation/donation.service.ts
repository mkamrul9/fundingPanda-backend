import prisma from '../../lib/prisma';
import { TDonation } from './donation.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';
import AppError from '../../errors/AppError';

const createDonationIntoDB = async (payload: TDonation) => {
    // 1. Check if the project exists and is APPROVED
    const project = await prisma.project.findUnique({ where: { id: payload.projectId } });

    if (!project) throw new AppError(404, 'Project not found');
    if (project.status !== 'APPROVED') {
        throw new AppError(400, 'Bad Request: You can only donate to APPROVED projects');
    }

    // 2. Proceed with the Transaction...

    const [donation, updatedProject] = await prisma.$transaction([
        prisma.donation.create({ data: payload }),
        prisma.project.update({
            where: { id: payload.projectId },
            data: { raisedAmount: { increment: payload.amount } },
        }),
    ]);
    return { donation, updatedProject };
};

const getAllDonationsFromDB = async (query: Record<string, unknown>) => {
    const donationQuery = new QueryBuilder(
        prisma.donation,
        query,
        {
            searchableFields: ['user.name', 'project.title'],
            filterableFields: ['amount', 'projectId', 'userId']
        }
    )
        .search()
        .filter()
        .sort()
        .paginate()
        .fields()
        .dynamicInclude(
            {
                user: { select: { name: true, email: true } },
                project: { select: { title: true, goalAmount: true, raisedAmount: true } }
            },
            ['user', 'project']
        );

    return await donationQuery.execute();
};

export const DonationService = {
    createDonationIntoDB,
    getAllDonationsFromDB,
};