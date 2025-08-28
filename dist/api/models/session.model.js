"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const sessionSchema = new mongoose_1.default.Schema({
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
    subject: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 15,
        max: 480 // 8 hours max
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    sessionType: {
        type: String,
        enum: ['one-on-one', 'group', 'exam-prep', 'homework-help'],
        default: 'one-on-one'
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    notes: String,
    meetingLink: String,
    recordingUrl: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: String
}, {
    timestamps: true
});
// Indexes for better query performance
sessionSchema.index({ studentId: 1, startTime: 1 });
sessionSchema.index({ tutorId: 1, startTime: 1 });
sessionSchema.index({ status: 1, startTime: 1 });
sessionSchema.index({ startTime: 1, endTime: 1 });
// Virtual for checking if session is in the past
sessionSchema.virtual('isPast').get(function () {
    return new Date() > this.endTime;
});
// Virtual for checking if session is happening now
sessionSchema.virtual('isNow').get(function () {
    const now = new Date();
    return now >= this.startTime && now <= this.endTime;
});
// Pre-save middleware to calculate endTime if not provided
sessionSchema.pre('save', function (next) {
    if (this.startTime && this.duration && !this.endTime) {
        this.endTime = new Date(this.startTime.getTime() + this.duration * 60000);
    }
    next();
});
exports.default = mongoose_1.default.model('Session', sessionSchema);
//# sourceMappingURL=session.model.js.map