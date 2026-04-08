import prisma from '../../lib/prisma';
import { TUser } from './user.interface';
import { UserRole } from '@prisma/client';
import AppError from '../../errors/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';



const getAllUsersFromDB = async (query: Record<string, unknown>) => {
    const userQuery = new QueryBuilder(
        prisma.user,
        query,
        {
            searchableFields: ['name', 'email', 'university', 'bio'],
            filterableFields: ['role', 'isVerified', 'categories.name'] // Allow filtering by category!
        }
    )
        .search()
        .filter()
        .sort()
        .paginate()
        .fields()
        .dynamicInclude(
            { categories: { select: { name: true } } },
            ['categories']
        );

    return await userQuery.execute();
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

const updateMyProfileInDB = async (userId: string, payload: any) => {
    const { categoryIds, name, bio, university, role } = payload || {};

    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (!existingUser) {
        throw new AppError(404, 'User not found');
    }

    const updateData: any = {};

    if (typeof name === 'string') updateData.name = name;
    if (typeof bio === 'string') updateData.bio = bio;
    if (typeof university === 'string') updateData.university = university;

    // Allow role switching only between STUDENT and SPONSOR for self-service profile edits.
    if (typeof role === 'string') {
        const normalizedRole = role.toUpperCase();
        const canSwitchRole =
            (existingUser.role === UserRole.STUDENT || existingUser.role === UserRole.SPONSOR) &&
            (normalizedRole === UserRole.STUDENT || normalizedRole === UserRole.SPONSOR);

        if (canSwitchRole) {
            updateData.role = normalizedRole;
        }
    }

    // If they sent categories, connect them to the user
    if (categoryIds && categoryIds.length > 0) {
        updateData.categories = {
            set: categoryIds.map((id: string) => ({ id })) // 'set' replaces old categories with new ones
        };
    }

    return await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { categories: true } // Return the updated categories
    });
};

const getTopSponsors = async () => {
    // 1. Find all users with the SPONSOR role
    const sponsors = await prisma.user.findMany({
        where: { role: 'SPONSOR' },
        include: {
            categories: { select: { name: true } },
            donations: { select: { amount: true } }, // Include their donations to calculate the total
        },
    });

    // 2. Map through them to calculate total donated
    const sponsorsWithTotals = sponsors.map((sponsor) => {
        const totalDonated = sponsor.donations.reduce((sum, donation) => sum + donation.amount, 0);
        return {
            id: sponsor.id,
            name: sponsor.name,
            bio: sponsor.bio,
            categories: sponsor.categories,
            totalDonated,
            supportCount: sponsor.donations.length,
        };
    });

    // 3. Sort by totalDonated descending
    return sponsorsWithTotals.sort((a, b) => b.totalDonated - a.totalDonated);
};

const getSingleUserFromDB = async (id: string) => {
    return await prisma.user.findUniqueOrThrow({
        where: { id },
        include: {
            categories: true,
            donations: { include: { project: { select: { title: true } } } } // See past donations
        }
    });
}

const getEmailVerificationStatusByEmail = async (email: string) => {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) {
        throw new AppError(400, 'Email query parameter is required');
    }

    const user = await prisma.user.findFirst({
        where: {
            email: {
                equals: normalizedEmail,
                mode: 'insensitive',
            },
        },
        select: {
            id: true,
            emailVerified: true,
        },
    });

    return {
        exists: Boolean(user),
        emailVerified: user?.emailVerified ?? false,
    };
};

export const UserService = {
    getAllUsersFromDB,
    getMyProfileFromDB,
    updateMyProfileInDB,
    getTopSponsors,
    getSingleUserFromDB,
    getEmailVerificationStatusByEmail,
};