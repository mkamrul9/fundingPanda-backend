import { z } from 'zod';

const updateProjectStatusZodSchema = z.object({
    body: z
        .object({
            status: z.enum(['APPROVED', 'DRAFT'], {
                message: 'Status must be APPROVED or DRAFT',
            }),
            adminFeedback: z.string().optional(),
        })
        .superRefine((val, ctx) => {
            if (val.status === 'DRAFT' && (!val.adminFeedback || val.adminFeedback.trim().length < 10)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['adminFeedback'],
                    message: 'Please provide at least 10 characters of feedback when rejecting',
                });
            }
        }),
});

const verifyUserZodSchema = z.object({
    body: z.object({
        isVerified: z.boolean({ message: 'isVerified boolean is required' }),
    }),
});

const toggleUserBanZodSchema = z.object({
    body: z.object({
        isBanned: z.boolean({ message: 'isBanned boolean is required' }),
    }),
});

export const AdminValidation = {
    updateProjectStatusZodSchema,
    verifyUserZodSchema,
    toggleUserBanZodSchema,
};