import prisma from '../../lib/prisma';
import { TDonation } from './donation.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { stripe } from '../../config/stripe.config';
import AppError from '../../errors/AppError';

const createDonationIntoDB = async (payload: TDonation) => {
    // 1. Check if the project exists and is APPROVED
    const project = await prisma.project.findUnique({ where: { id: payload.projectId } });

    if (!project) throw new AppError(404, 'Project not found');
    if (project.status !== 'APPROVED') {
        throw new AppError(400, 'Bad Request: You can only donate to APPROVED projects');
    }

    // 2. Proceed with the Transaction...

    const [donation, updatedProject] = await prisma.$transaction([
        prisma.donation.create({ data: payload }),
        prisma.project.update({
            where: { id: payload.projectId },
            data: { raisedAmount: { increment: payload.amount } },
        }),
    ]);
    return { donation, updatedProject };
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

const createCheckoutSession = async (userId: string, payload: { amount: number, projectId: string }) => {
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
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/projects/${payload.projectId}`,
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
    createCheckoutSession
};