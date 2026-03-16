import prisma from '../../lib/prisma';
import { TCategory } from './category.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';

const createCategoryIntoDB = async (payload: TCategory) => {
    return await prisma.category.create({ data: payload });
};

const getAllCategoriesFromDB = async (query: Record<string, unknown>) => {
    const categoryQuery = new QueryBuilder(prisma.category, query, {
        searchableFields: ['name', 'description'],
        filterableFields: ['name']
    }).search().sort().paginate().fields();

    return await categoryQuery.execute();
};

const updateCategoryInDB = async (id: string, payload: Partial<TCategory>) => {
    return await prisma.category.update({
        where: { id },
        data: payload,
    });
};

const deleteCategoryFromDB = async (id: string) => {
    return await prisma.category.delete({ where: { id } });
};

export const CategoryService = { createCategoryIntoDB, getAllCategoriesFromDB, updateCategoryInDB, deleteCategoryFromDB };