import mongoose from 'mongoose';
export interface IPayment extends mongoose.Document {
    sessionId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    tutorId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
    paymentMethod: 'stripe' | 'paypal' | 'bank_transfer';
    stripePaymentIntentId?: string;
    stripeChargeId?: string;
    paypalOrderId?: string;
    paypalCaptureId?: string;
    description: string;
    metadata?: Record<string, any>;
    refundReason?: string;
    refundAmount?: number;
    refundedAt?: Date;
    failureReason?: string;
    failureCode?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, {}> & IPayment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=payment.model.d.ts.map