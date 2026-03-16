import prisma from '../../lib/prisma';
import { TResource } from './resource.interface';
import AppError from '../../errors/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';

const createResourceIntoDB = async (payload: TResource, lenderId: string) => {
    const { categoryIds, totalCapacity = 1, ...resourceData } = payload;

    // Ensure numeric totalCapacity (default to 1)
    const finalCapacity = typeof totalCapacity === 'number' ? totalCapacity : Number(totalCapacity) || 1;

    const data: any = {
        ...resourceData,
        lenderId,
        // Prisma model uses totalQuantity / availableQuantity
        totalQuantity: finalCapacity,
        availableQuantity: finalCapacity,
    };

    // Connect the categories dynamically
    if (categoryIds && categoryIds.length > 0) {
        data.categories = { connect: categoryIds.map((id) => ({ id })) };
    }

    return await prisma.resource.create({ data, include: { categories: true } });
};

const getAllResourcesFromDB = async (query: Record<string, unknown>) => {
    const resourceQuery = new QueryBuilder(prisma.resource, query, {
        searchableFields: ['name', 'description', 'lender.name'],
        filterableFields: ['type', 'categories.name', 'lenderId']
    })
        .search().filter().sort().paginate().fields()
        .dynamicInclude({
            lender: { select: { name: true, email: true } },
            categories: { select: { name: true } }
        }, ['lender', 'categories']);

    return await resourceQuery.execute();
};

const deleteResourceFromDB = async (id: string, userId: string) => {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new AppError(404, 'Resource not found');

    if (resource.lenderId !== userId) throw new AppError(403, 'You can only delete your own resources');

    // Enforce Availability Guard: Cannot delete if ANY software license or hardware is rented out
    const available = typeof resource.availableQuantity === 'number' ? resource.availableQuantity : (resource.availableQuantity ?? 0);
    const total = typeof resource.totalQuantity === 'number' ? resource.totalQuantity : (resource.totalQuantity ?? 0);

    if (available < total) {
        throw new AppError(400, 'Cannot delete a resource while students are currently using it');
    }

    return await prisma.resource.delete({ where: { id } });
};

export const ResourceService = { createResourceIntoDB, getAllResourcesFromDB, deleteResourceFromDB };