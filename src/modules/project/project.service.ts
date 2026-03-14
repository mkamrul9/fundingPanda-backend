import prisma from '../../lib/prisma';
import { TProject } from './project.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';

const createProjectIntoDB = async (payload: TProject) => {
    const result = await prisma.project.create({
        data: payload,
    });
    return result;
};

const getAllProjectsFromDB = async (query: Record<string, unknown>) => {
    const projectQuery = new QueryBuilder(
        prisma.project,
        query,
        {
            searchableFields: ['title', 'description', 'student.name'],
            filterableFields: ['status', 'goalAmount', 'student.university']
        }
    )
        .search()
        .filter()
        .sort()
        .paginate()
        .fields()
        .dynamicInclude(
            { student: { select: { name: true, email: true, university: true } } },
            ['student'] // Default include student details
        );

    return await projectQuery.execute();
};

export const ProjectService = {
    createProjectIntoDB,
    getAllProjectsFromDB,
};