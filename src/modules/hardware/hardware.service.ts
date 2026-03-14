import prisma from '../../utils/prisma';
import { THardware } from './hardware.interface';

const createHardwareIntoDB = async (payload: THardware) => {
    const result = await prisma.hardware.create({
        data: payload,
    });
    return result;
};

const getAllHardwareFromDB = async () => {
    // Include lender details so the frontend can show who owns the hardware
    return await prisma.hardware.findMany({
        include: {
            lender: {
                select: { name: true, email: true, bio: true },
            },
        },
    });
};

export const HardwareService = {
    createHardwareIntoDB,
    getAllHardwareFromDB,
};