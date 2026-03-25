import { sendEmail } from '../../utils/email';

type TContactPayload = {
    name: string;
    email: string;
    subject?: string;
    message: string;
};

const resolveAdminEmail = () => {
    const explicitAdmin = (process.env.ADMIN_EMAIL || '').trim();
    if (explicitAdmin) return explicitAdmin;

    const fromEmail = (process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || '').trim();
    if (fromEmail) return fromEmail;

    return 'support@fundingpanda.com';
};

const subscribeNewsletter = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    await sendEmail({
        to: normalizedEmail,
        subject: 'Welcome to FundingPanda Newsletter',
        templateName: 'newsletter-welcome',
        templateData: {
            email: normalizedEmail,
        },
    });

    return {
        subscribed: true,
        email: normalizedEmail,
    };
};

const submitContact = async (payload: TContactPayload) => {
    const ticketId = `FP-${Date.now().toString(36).toUpperCase()}`;
    const adminEmail = resolveAdminEmail();
    const subject = payload.subject?.trim() || 'General Inquiry';

    await sendEmail({
        to: adminEmail,
        subject: `[Contact] ${subject} | ${ticketId}`,
        templateName: 'contact-admin',
        templateData: {
            ticketId,
            name: payload.name,
            email: payload.email,
            subject,
            message: payload.message,
        },
    });

    await sendEmail({
        to: payload.email,
        subject: `We received your message (${ticketId})`,
        templateName: 'contact-ack',
        templateData: {
            ticketId,
            name: payload.name,
        },
    });

    return {
        ticketId,
        status: 'received',
    };
};

export const EngagementService = {
    subscribeNewsletter,
    submitContact,
};
