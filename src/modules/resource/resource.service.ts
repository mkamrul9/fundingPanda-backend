import prisma from '../../lib/prisma';
import { TResource } from './resource.interface';
import { Prisma, ResourceType } from '@prisma/client';
import AppError from '../../errors/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';

const createResourceIntoDB = async (payload: TResource) => {
    // Ensure numeric fields are numbers and have sensible defaults
    const total = payload.totalQuantity !== undefined ? Number(payload.totalQuantity) : 1;
    const available = payload.availableQuantity !== undefined ? Number(payload.availableQuantity) : total;

    const typeValue: ResourceType = (payload.type ? (payload.type as ResourceType) : ResourceType.HARDWARE);

    const data: Prisma.ResourceCreateInput = {
        name: payload.name,
        description: payload.description,
        type: typeValue,
        totalQuantity: total,
        availableQuantity: available,
        lender: {
            connect: { id: payload.lenderId }
        },
        categories: payload && (payload as any).categories ? {
            connect: (payload as any).categories.map((c: any) => ({ id: c }))
        } : undefined,
    };

    return await prisma.resource.create({ data });
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

    // Build an update object explicitly to match Prisma's generated types
    const updateData: Prisma.ResourceUpdateInput = {} as Prisma.ResourceUpdateInput;

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.type !== undefined) updateData.type = payload.type as any;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.totalQuantity !== undefined) updateData.totalQuantity = payload.totalQuantity as any;
    if (payload.availableQuantity !== undefined) updateData.availableQuantity = payload.availableQuantity as any;

    return await prisma.resource.update({
        where: { id },
        data: updateData,
    });
};

const deleteResourceFromDB = async (id: string, userId: string) => {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new AppError(404, 'Resource not found');

    if (resource.lenderId !== userId) {
        throw new AppError(403, 'Forbidden: You can only delete your own resources');
    }

    // Prevent deletion if some items are lent out (use null-safe coalesce)
    const available = resource.availableQuantity ?? 0;
    const total = resource.totalQuantity ?? 0;
    if (available < total) {
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