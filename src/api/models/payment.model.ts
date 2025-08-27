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

const paymentSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer'],
    required: true
  },
  stripePaymentIntentId: String,
  stripeChargeId: String,
  paypalOrderId: String,
  paypalCaptureId: String,
  description: {
    type: String,
    required: true
  },
  metadata: mongoose.Schema.Types.Mixed,
  refundReason: String,
  refundAmount: {
    type: Number,
    min: 0
  },
  refundedAt: Date,
  failureReason: String,
  failureCode: String
}, { 
  timestamps: true 
});

// Indexes for better query performance
paymentSchema.index({ sessionId: 1 });
paymentSchema.index({ studentId: 1 });
paymentSchema.index({ tutorId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ paypalOrderId: 1 });

// Virtual for checking if payment is refundable
paymentSchema.virtual('isRefundable').get(function(this: any) {
  return this.status === 'completed' && !this.refundAmount;
});

// Virtual for checking if payment can be cancelled
paymentSchema.virtual('isCancellable').get(function(this: any) {
  return ['pending', 'processing'].includes(this.status);
});

// Pre-save middleware to update refundedAt
paymentSchema.pre('save', function(this: any, next) {
  if (this.refundAmount && !this.refundedAt) {
    this.refundedAt = new Date();
  }
  next();
});

export default mongoose.model<IPayment>('Payment', paymentSchema);
