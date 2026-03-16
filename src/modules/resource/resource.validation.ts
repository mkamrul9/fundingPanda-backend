import { z } from 'zod';

const createResourceZodSchema = z.object({
    body: z.object({
        name: z.string({ message: 'Resource name is required' }),
        description: z.string({ message: 'Description is required' }),
        type: z.enum(['HARDWARE', 'SOFTWARE'], { message: 'Type is required' }),
        totalCapacity: z.coerce.number().int().positive().optional(),
        categoryIds: z.array(z.string()).optional(),
    }).refine((data) => {
        if (data.type === 'HARDWARE') {
            return data.totalCapacity === undefined || data.totalCapacity === 1;
        }
        return true;
    }, {
        message: 'Hardware capacity must be exactly 1. Only software can have multiple licenses.',
        path: ['totalCapacity'],
    }),
});

export const ResourceValidation = { createResourceZodSchema };