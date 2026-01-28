import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        // Skip sending if SMTP not configured (for development)
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('Email not sent (SMTP not configured):', options);
            return true; // Return true to not break flow in dev
        }

        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            ...options,
        });

        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
}

export async function sendOrderConfirmationEmail(
    email: string,
    orderId: number,
    totalCents: number
): Promise<boolean> {
    return sendEmail({
        to: email,
        subject: `Order Confirmation #${orderId}`,
        text: `Your order #${orderId} has been confirmed. Total: $${(totalCents / 100).toFixed(2)}`,
        html: `
            <h1>Order Confirmation</h1>
            <p>Your order #${orderId} has been confirmed.</p>
            <p>Total: $${(totalCents / 100).toFixed(2)}</p>
        `,
    });
}

export async function sendOrderPaidEmail(
    email: string,
    orderId: number
): Promise<boolean> {
    return sendEmail({
        to: email,
        subject: `Order #${orderId} Payment Received`,
        text: `Payment for order #${orderId} has been received.`,
        html: `
            <h1>Payment Received</h1>
            <p>Payment for order #${orderId} has been received.</p>
        `,
    });
}

export async function sendOrderCancelledEmail(
    email: string,
    orderId: number
): Promise<boolean> {
    return sendEmail({
        to: email,
        subject: `Order #${orderId} Cancelled`,
        text: `Your order #${orderId} has been cancelled.`,
        html: `
            <h1>Order Cancelled</h1>
            <p>Your order #${orderId} has been cancelled.</p>
        `,
    });
}
