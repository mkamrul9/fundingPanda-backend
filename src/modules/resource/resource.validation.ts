import { z } from 'zod';

const createResourceZodSchema = z.object({
    name: z.string().nonempty({ message: 'Resource name is required' }),
    type: z.enum(['HARDWARE', 'SOFTWARE']).optional(),
    description: z.string().nonempty({ message: 'Description is required' }),
    totalQuantity: z.coerce.number().optional(),
});

export const ResourceValidation = {
    createResourceZodSchema,
};