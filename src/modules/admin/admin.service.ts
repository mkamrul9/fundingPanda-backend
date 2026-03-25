import prisma from '../../lib/prisma';
import { TToggleUserBan, TUpdateProjectStatus, TVerifyUser } from './admin.interface';

const verifyUserInDB = async (userId: string, payload: TVerifyUser) => {
    const result = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: payload.isVerified },
    });
    return result;
};

const changeProjectStatusInDB = async (projectId: string, payload: TUpdateProjectStatus) => {
    return await prisma.project.update({
        where: { id: projectId },
        data: {
            status: payload.status,
            adminFeedback: payload.status === 'DRAFT' ? payload.adminFeedback || null : null,
        },
    });
};

const getModerationQueueFromDB = async () => {
    return await prisma.project.findMany({
        where: {
            status: 'PENDING',
        },
        include: {
            student: {
                select: {
                    name: true,
                    email: true,
                    university: true,
                },
            },
            categories: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

const getPlatformAnalytics = async () => {
    const [
        totalUsers,
        totalProjects,
        pendingProjects,
        totalResources,
        totalDonationsAggregation
    ] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.project.count({ where: { status: 'PENDING' } }),
        prisma.resource.count(),
        prisma.donation.aggregate({ _sum: { amount: true } })
    ]);

    return {
        totalUsers,
        totalProjects,
        pendingProjects,
        totalResources,
        totalFundsRaised: totalDonationsAggregation._sum.amount || 0,
    };
};

const toggleUserBanInDB = async (userId: string, payload: TToggleUserBan) => {
    const result = await prisma.user.update({
        where: { id: userId },
        data: { isBanned: payload.isBanned },
    });
    return result;
};

export const AdminService = {
    verifyUserInDB,
    toggleUserBanInDB,
    changeProjectStatusInDB,
    getModerationQueueFromDB,
    getPlatformAnalytics
};