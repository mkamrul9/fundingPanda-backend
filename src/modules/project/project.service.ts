import prisma from '../../lib/prisma';
import { TProject } from './project.interface';
import AppError from '../../errors/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';

const createProjectIntoDB = async (payload: TProject) => {
    const { categories, ...projectData } = payload;

    const result = await prisma.project.create({
        data: {
            ...projectData,
            categories: categories?.length
                ? { connect: categories.map((id) => ({ id })) }
                : undefined,
        },
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
            filterableFields: ['status', 'goalAmount', 'student.university', 'categories.some.id']
        }
    )
        .search()
        .filter()
        .sort()
        .paginate()
        .fields()
        .dynamicInclude(
            {
                student: { select: { name: true, email: true, university: true } },
                categories: true,
            },
            ['student', 'categories'] // Default include student details and categories
        );

    return await projectQuery.execute();
};

const getMyProjectsFromDB = async (studentId: string) => {
    return await prisma.project.findMany({
        where: { studentId },
        include: {
            categories: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

const getMySingleProjectFromDB = async (projectId: string, studentId: string) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            categories: true,
        },
    });

    if (!project) {
        throw new AppError(404, 'Project not found');
    }

    if (project.studentId !== studentId) {
        throw new AppError(403, 'Forbidden: You can only access your own project');
    }

    return project;
};


const getSingleProjectFromDB = async (id: string) => {
    return await prisma.project.findUniqueOrThrow({
        where: { id },
        include: {
            student: { select: { name: true, email: true, university: true } },
            donations: { include: { user: { select: { name: true } } } }, // Show who donated
            categories: true,
        },
    });
};

const getProjectPitchDocUrlFromDB = async (id: string) => {
    const project = await prisma.project.findUnique({
        where: { id },
        select: {
            id: true,
            pitchDocUrl: true,
        },
    });

    if (!project) {
        throw new AppError(404, 'Project not found');
    }

    return project.pitchDocUrl;
};

const getProjectPitchDocMetaFromDB = async (id: string) => {
    const project = await prisma.project.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            pitchDocUrl: true,
        },
    });

    if (!project) {
        throw new AppError(404, 'Project not found');
    }

    return project;
};

const updateProjectInDB = async (id: string, userId: string, payload: Partial<TProject>) => {
    // 1. Fetch the project
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError(404, 'Project not found');

    // 2. Enforce Ownership
    if (project.studentId !== userId) {
        throw new AppError(403, 'Forbidden: You can only edit your own projects');
    }

    const { categories, ...restPayload } = payload;

    // 3. Update if checks pass
    return await prisma.project.update({
        where: { id },
        data: {
            ...restPayload,
            categories: categories ? { set: categories.map((categoryId) => ({ id: categoryId })) } : undefined,
        },
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

const markProjectCompletedInDB = async (projectId: string, sponsorId: string) => {
    // 1. Verify this sponsor actually donated to this project
    const donation = await prisma.donation.findFirst({
        where: { projectId: projectId as string, userId: sponsorId }
    });

    if (!donation) {
        throw new AppError(403, 'Only a sponsor who funded this project can mark it as completed.');
    }

    // 2. Update status and add a Timeline Event within a transaction
    const result = await prisma.$transaction(async (tx) => {
        const updatedProject = await tx.project.update({
            where: { id: projectId },
            data: { status: 'COMPLETED' }
        });

        await tx.timelineEvent.create({
            data: {
                projectId: projectId,
                type: 'STATUS_SYNC',
                title: 'Project Completed!',
                description: 'The sponsor has reviewed the work and marked this project as successfully completed.',
            }
        });

        return updatedProject;
    });

    return result;
};

export const ProjectService = {
    createProjectIntoDB,
    getAllProjectsFromDB,
    getMyProjectsFromDB,
    getMySingleProjectFromDB,
    getSingleProjectFromDB,
    getProjectPitchDocUrlFromDB,
    getProjectPitchDocMetaFromDB,
    updateProjectInDB,
    deleteProjectFromDB,
    markProjectCompletedInDB,
};