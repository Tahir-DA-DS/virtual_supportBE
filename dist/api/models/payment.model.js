"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    sessionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    studentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tutorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
    metadata: mongoose_1.default.Schema.Types.Mixed,
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
paymentSchema.virtual('isRefundable').get(function () {
    return this.status === 'completed' && !this.refundAmount;
});
// Virtual for checking if payment can be cancelled
paymentSchema.virtual('isCancellable').get(function () {
    return ['pending', 'processing'].includes(this.status);
});
// Pre-save middleware to update refundedAt
paymentSchema.pre('save', function (next) {
    if (this.refundAmount && !this.refundedAt) {
        this.refundedAt = new Date();
    }
    next();
});
exports.default = mongoose_1.default.model('Payment', paymentSchema);
//# sourceMappingURL=payment.model.js.map