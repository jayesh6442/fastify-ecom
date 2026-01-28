export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}
export declare function sendEmail(options: EmailOptions): Promise<boolean>;
export declare function sendOrderConfirmationEmail(email: string, orderId: number, totalCents: number): Promise<boolean>;
export declare function sendOrderPaidEmail(email: string, orderId: number): Promise<boolean>;
export declare function sendOrderCancelledEmail(email: string, orderId: number): Promise<boolean>;
//# sourceMappingURL=email.d.ts.map