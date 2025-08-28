import { IPayment } from '../models/payment.model';
import Stripe from 'stripe';
export interface CreatePaymentData {
    sessionId: string;
    studentId: string;
    tutorId: string;
    amount: number;
    currency?: string;
    paymentMethod: 'stripe' | 'paypal' | 'bank_transfer';
    description?: string;
}
export interface PaymentIntentData {
    amount: number;
    currency: string;
    sessionId: string;
    studentId: string;
    tutorId: string;
    description?: string;
}
export interface RefundData {
    paymentId: string;
    amount?: number;
    reason?: string;
}
/**
 * Create a payment record
 */
export declare const createPayment: (data: CreatePaymentData) => Promise<IPayment>;
/**
 * Create Stripe payment intent
 */
export declare const createStripePaymentIntent: (data: PaymentIntentData) => Promise<{
    paymentIntent: Stripe.PaymentIntent;
    payment: IPayment;
}>;
/**
 * Confirm Stripe payment
 */
export declare const confirmStripePayment: (paymentIntentId: string) => Promise<IPayment>;
/**
 * Process Stripe webhook
 */
export declare const processStripeWebhook: (event: Stripe.Event) => Promise<void>;
/**
 * Process refund
 */
export declare const processRefund: (data: RefundData) => Promise<IPayment>;
/**
 * Get payment by ID
 */
export declare const getPaymentById: (paymentId: string) => Promise<IPayment | null>;
/**
 * Get payments with filters
 */
export declare const getPayments: (filters: {
    studentId?: string;
    tutorId?: string;
    status?: string;
    paymentMethod?: string;
    startDate?: Date;
    endDate?: Date;
}) => Promise<IPayment[]>;
/**
 * Get payment statistics
 */
export declare const getPaymentStats: (userId: string, userRole: string) => Promise<any>;
//# sourceMappingURL=payment.service.d.ts.map