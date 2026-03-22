import { Request, Response } from 'express';
import { stripe } from '../../config/stripe.config';
import { DonationService } from './donation.service';
import Stripe from 'stripe';

const handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env['STRIPE_WEBHOOK_SECRET '];

    if (!endpointSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET env var');
        return res.status(500).json({ success: false, message: 'Webhook secret is not configured' });
    }

    let event: Stripe.Event;

    try {
        // We must use req.body directly as a Buffer here (we will configure Express for this next)
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Retrieve the metadata we securely attached in Phase 24
        const projectId = session.metadata?.projectId;
        const userId = session.metadata?.userId;
        const amountInCents = session.amount_total;

        if (projectId && userId && amountInCents) {
            const amount = amountInCents / 100; // Convert back to dollars

            try {
                // CALL THE PRISMA TRANSACTION HERE!
                await DonationService.createDonationIntoDB({ amount, projectId, userId });
                console.log(`Payment success! Donation recorded for Project: ${projectId}`);
            } catch (dbError) {
                console.error('Database update failed after successful payment:', dbError);
            }
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
};

export const DonationWebhook = { handleStripeWebhook };