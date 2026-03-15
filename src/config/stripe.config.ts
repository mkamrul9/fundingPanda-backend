import Stripe from 'stripe';
import 'dotenv/config';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-02-25.clover',
});