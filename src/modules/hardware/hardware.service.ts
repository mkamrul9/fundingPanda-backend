import prisma from '../../lib/prisma';
import { THardware } from './hardware.interface';
import AppError from '../../errors/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';

const createHardwareIntoDB = async (payload: THardware) => {
    return await prisma.hardware.create({ data: payload });
};

const getAllHardwareFromDB = async (query: Record<string, unknown>) => {
    const hardwareQuery = new QueryBuilder(
        prisma.hardware,
        query,
        {
            searchableFields: ['name', 'category', 'description', 'lender.name'],
            filterableFields: ['category', 'isAvailable', 'lenderId']
        }
    )
        .search()
        .filter()
        .sort()
        .paginate()
        .fields()
        .dynamicInclude(
            { lender: { select: { name: true, email: true, bio: true } } },
            ['lender']
        );

    return await hardwareQuery.execute();
};

const getSingleHardwareFromDB = async (id: string) => {
    return await prisma.hardware.findUniqueOrThrow({
        where: { id },
        include: {
            lender: { select: { name: true, email: true, bio: true } },
        },
    });
};

const updateHardwareInDB = async (id: string, userId: string, payload: Partial<THardware>) => {
    // 1. Fetch hardware
    const hardware = await prisma.hardware.findUnique({ where: { id } });
    if (!hardware) throw new AppError(404, 'Hardware not found');

    // 2. Enforce Ownership
    if (hardware.lenderId !== userId) {
        throw new AppError(403, 'Forbidden: You can only edit your own hardware listings');
    }

    return await prisma.hardware.update({
        where: { id },
        data: payload,
    });
};

const deleteHardwareFromDB = async (id: string, userId: string) => {
    // 1. Fetch hardware
    const hardware = await prisma.hardware.findUnique({ where: { id } });
    if (!hardware) throw new AppError(404, 'Hardware not found');

    // 2. Enforce Ownership
    if (hardware.lenderId !== userId) {
        throw new AppError(403, 'Forbidden: You can only delete your own hardware listings');
    }

    // 3. Enforce Availability Guard
    if (!hardware.isAvailable) {
        throw new AppError(400, 'Bad Request: Cannot delete hardware that is currently rented out to a student');
    }

    return await prisma.hardware.delete({
        where: { id },
    });
};

// Export the new functions
export const HardwareService = {
    createHardwareIntoDB,
    getAllHardwareFromDB,
    getSingleHardwareFromDB,
    updateHardwareInDB,
    deleteHardwareFromDB
};