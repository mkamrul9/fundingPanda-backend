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


const getSingleProjectFromDB = async (id: string) => {
    return await prisma.project.findUniqueOrThrow({
        where: { id },
        include: {
            student: { select: { name: true, email: true, university: true } },
            donations: { include: { user: { select: { name: true } } } }, // Show who donated
        },
    });
};

const updateProjectInDB = async (id: string, payload: Partial<TProject>) => {
    return await prisma.project.update({
        where: { id },
        data: payload,
    });
};

const deleteProjectFromDB = async (id: string) => {
    return await prisma.project.delete({
        where: { id },
    });
};


export const ProjectService = {
    createProjectIntoDB,
    getAllProjectsFromDB,
    getSingleProjectFromDB,
    updateProjectInDB,
    deleteProjectFromDB,
};