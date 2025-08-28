import { Request, Response } from 'express';
/**
 * Create Stripe payment intent
 */
export declare const createPaymentIntent: (req: Request, res: Response) => Promise<void>;
/**
 * Confirm Stripe payment
 */
export declare const confirmPayment: (req: Request, res: Response) => Promise<void>;
/**
 * Process refund
 */
export declare const refundPayment: (req: Request, res: Response) => Promise<void>;
/**
 * Get payment by ID
 */
export declare const getPayment: (req: Request, res: Response) => Promise<void>;
/**
 * Get payments with filters
 */
export declare const getPaymentsList: (req: Request, res: Response) => Promise<void>;
/**
 * Get payment statistics for authenticated user
 */
export declare const getMyPaymentStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=payment.controller.d.ts.map