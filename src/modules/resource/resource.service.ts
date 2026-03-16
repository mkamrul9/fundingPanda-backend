import prisma from '../../lib/prisma';
import { TResource } from './resource.interface';
import AppError from '../../errors/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';

const createResourceIntoDB = async (payload: TResource) => {
    return await prisma.resource.create({ data: payload });
};

const getAllResourcesFromDB = async (query: Record<string, unknown>) => {
    const resourceQuery = new QueryBuilder(
        prisma.resource,
        query,
        {
            searchableFields: ['name', 'description', 'lender.name'],
            filterableFields: ['type', 'availableQuantity', 'lenderId']
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

    return await resourceQuery.execute();
};

const getSingleResourceFromDB = async (id: string) => {
    return await prisma.resource.findUniqueOrThrow({
        where: { id },
        include: {
            lender: { select: { name: true, email: true, bio: true } },
        },
    });
};

const updateResourceInDB = async (id: string, userId: string, payload: Partial<TResource>) => {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new AppError(404, 'Resource not found');

    if (resource.lenderId !== userId) {
        throw new AppError(403, 'Forbidden: You can only edit your own resources');
    }

    return await prisma.resource.update({
        where: { id },
        data: payload,
    });
};

const deleteResourceFromDB = async (id: string, userId: string) => {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new AppError(404, 'Resource not found');

    if (resource.lenderId !== userId) {
        throw new AppError(403, 'Forbidden: You can only delete your own resources');
    }

    // Prevent deletion if some items are lent out
    if (resource.availableQuantity < resource.totalQuantity) {
        throw new AppError(400, 'Bad Request: Cannot delete a resource with active allocations');
    }

    return await prisma.resource.delete({ where: { id } });
};

// Export the new functions
export const ResourceService = {
    createResourceIntoDB,
    getAllResourcesFromDB,
    getSingleResourceFromDB,
    updateResourceInDB,
    deleteResourceFromDB,
};