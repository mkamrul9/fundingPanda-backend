import { z } from 'zod';

const createProjectZodSchema = z.object({
    body: z.object({
        title: z.string({ message: 'Title is required' }),
        description: z.string({ message: 'Description is required' }),
        goalAmount: z.number({ message: 'Goal amount is required' }).positive(),
        studentId: z.string({ message: 'Student ID is required' }), // Note: Later, this will come from the Auth token, not the body!
    }),
});

export const ProjectValidation = {
    createProjectZodSchema,
};