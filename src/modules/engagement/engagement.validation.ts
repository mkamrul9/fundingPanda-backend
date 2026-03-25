import { z } from 'zod';

const subscribeNewsletterZodSchema = z.object({
    body: z.object({
        email: z.email({ message: 'A valid email is required.' }),
    }),
});

const submitContactZodSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
        email: z.email({ message: 'A valid email is required.' }),
        subject: z.string().trim().max(160).optional(),
        message: z.string().trim().min(10, { message: 'Message must be at least 10 characters.' }).max(5000),
    }),
});

export const EngagementValidation = {
    subscribeNewsletterZodSchema,
    submitContactZodSchema,
};
