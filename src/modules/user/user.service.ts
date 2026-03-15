import prisma from '../../lib/prisma';
import { TUser } from './user.interface';
import { UserRole } from '@prisma/client';
import AppError from '../../errors/AppError';

const createUserIntoDB = async (payload: TUser) => {
    const result = await prisma.user.create({
        data: payload,
    });
    return result;
};

const getAllUsersFromDB = async () => {
    return await prisma.user.findMany();
};

const getMyProfileFromDB = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
            university: true,
            bio: true,
            createdAt: true,
            // Do NOT select the password hash!
        },
    });

    if (!user) throw new AppError(404, 'User not found');
    return user;
};

const updateMyProfileInDB = async (userId: string, payload: { name?: string; bio?: string; university?: string }) => {
    return await prisma.user.update({
        where: { id: userId },
        data: payload,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            university: true,
            bio: true,
        },
    });
};

export const UserService = {
    createUserIntoDB,
    getAllUsersFromDB,
    getMyProfileFromDB,
    updateMyProfileInDB
};