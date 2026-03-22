import prisma from '../../lib/prisma';
import { TDonation } from './donation.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { stripe } from '../../config/stripe.config';
import AppError from '../../errors/AppError';

const createDonationIntoDB = async (payload: { amount: number; projectId: string; userId: string }) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Create the donation record
        const donation = await tx.donation.create({ data: payload });

        // 2. Update the project's raised amount
        await tx.project.update({
            where: { id: payload.projectId },
            data: { raisedAmount: { increment: payload.amount } },
        });

        // 3. NEW: Automatically log this on the project timeline!
        await tx.timelineEvent.create({
            data: {
                projectId: payload.projectId,
                type: 'DONATION',
                title: 'Project Funded!',
                description: `A sponsor has generously funded this project with $${payload.amount}.`,
            },
        });

        return donation;
    });
};

const getAllDonationsFromDB = async (query: Record<string, unknown>) => {
    const donationQuery = new QueryBuilder(
        prisma.donation,
        query,
        {
            searchableFields: ['user.name', 'project.title'],
            filterableFields: ['amount', 'projectId', 'userId']
        }
    )
        .search()
        .filter()
        .sort()
        .paginate()
        .fields()
        .dynamicInclude(
            {
                user: { select: { name: true, email: true } },
                project: { select: { title: true, goalAmount: true, raisedAmount: true } }
            },
            ['user', 'project']
        );

    return await donationQuery.execute();
};

const getMyDonationsFromDB = async (userId: string) => {
    return await prisma.donation.findMany({
        where: { userId },
        include: {
            project: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    raisedAmount: true,
                    goalAmount: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

const createCheckoutSession = async (userId: string, payload: { amount: number, projectId: string }) => {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
        throw new AppError(500, 'FRONTEND_URL environment variable is not configured');
    }

    // 1. Verify project exists and is APPROVED
    const project = await prisma.project.findUnique({ where: { id: payload.projectId } });

    if (!project) throw new AppError(404, 'Project not found');
    if (project.status !== 'APPROVED') {
        throw new AppError(400, 'Bad Request: You can only donate to APPROVED projects');
    }

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/projects/${payload.projectId}`,
        customer_email: undefined, // we could fetch the user's email and put it here
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Donation to: ${project.title}`,
                        description: `Funding thesis project for student ID: ${project.studentId}`,
                    },
                    unit_amount: Math.round(payload.amount * 100), // Stripe expects amounts in cents!
                },
                quantity: 1,
            },
        ],
        metadata: {
            userId,
            projectId: payload.projectId,
        },
    });

    return { paymentUrl: session.url };
};

export const DonationService = {
    createDonationIntoDB,
    getAllDonationsFromDB,
    getMyDonationsFromDB,
    createCheckoutSession
};