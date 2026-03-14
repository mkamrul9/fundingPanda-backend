import { z } from 'zod';

const createDonationZodSchema = z.object({
    amount: z.number().positive({ message: 'Amount must be positive' }),
    userId: z.string().nonempty({ message: 'User ID is required' }),
    projectId: z.string().nonempty({ message: 'Project ID is required' }),
});

export const DonationValidation = {
    createDonationZodSchema,
};