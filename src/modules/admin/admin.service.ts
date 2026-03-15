import prisma from '../../lib/prisma';
import { TUpdateProjectStatus, TVerifyUser } from './admin.interface';

const verifyUserInDB = async (userId: string, payload: TVerifyUser) => {
    const result = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: payload.isVerified },
    });
    return result;
};

const changeProjectStatusInDB = async (projectId: string, payload: { status: any, feedback?: string }) => {
    return await prisma.project.update({
        where: { id: projectId },
        data: {
            status: payload.status,
            adminFeedback: payload.feedback || null, // Save feedback or clear it
        },
    });
};

const getPlatformAnalytics = async () => {
    const [
        totalUsers,
        totalProjects,
        pendingProjects,
        totalHardware,
        totalDonationsAggregation
    ] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.project.count({ where: { status: 'PENDING' } }),
        prisma.hardware.count(),
        prisma.donation.aggregate({ _sum: { amount: true } })
    ]);

    return {
        totalUsers,
        totalProjects,
        pendingProjects,
        totalHardware,
        totalFundsRaised: totalDonationsAggregation._sum.amount || 0,
    };
};


export const AdminService = {
    verifyUserInDB,
    changeProjectStatusInDB,
    getPlatformAnalytics
};