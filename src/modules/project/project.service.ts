import prisma from '../../lib/prisma';
import { TProject } from './project.interface';
import AppError from '../../errors/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';

const createProjectIntoDB = async (payload: TProject) => {
    const result = await prisma.project.create({
        data: payload,
    });
    return result;
};

const getAllProjectsFromDB = async (query: Record<string, unknown>) => {
    // Force the status to be APPROVED for public listing
    const finalQuery = { ...query, status: 'APPROVED' };

    const projectQuery = new QueryBuilder(
        prisma.project,
        finalQuery,
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

const updateProjectInDB = async (id: string, userId: string, payload: Partial<TProject>) => {
    // 1. Fetch the project
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError(404, 'Project not found');

    // 2. Enforce Ownership
    if (project.studentId !== userId) {
        throw new AppError(403, 'Forbidden: You can only edit your own projects');
    }

    // 3. Update if checks pass
    return await prisma.project.update({
        where: { id },
        data: payload,
    });
};


const deleteProjectFromDB = async (id: string, userId: string) => {
    // 1. Fetch the project
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError(404, 'Project not found');

    // 2. Enforce Ownership
    if (project.studentId !== userId) {
        throw new AppError(403, 'Forbidden: You can only delete your own projects');
    }

    // 3. Enforce Funding Constraint (Cannot delete if money is raised)
    if (project.raisedAmount > 0) {
        throw new AppError(400, 'Bad Request: Cannot delete a project that has already received funding');
    }

    // 4. Delete if checks pass
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