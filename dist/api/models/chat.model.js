"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    messageType: {
        type: String,
        enum: ['text', 'file', 'image', 'system'],
        default: 'text'
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date
}, {
    timestamps: true
});
const chatSchema = new mongoose_1.default.Schema({
    participants: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
    sessionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Session'
    },
    lastMessage: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageAt: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Indexes for better query performance
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ sessionId: 1 });
chatSchema.index({ lastMessageAt: -1 });
// Virtual for unread message count
chatSchema.virtual('unreadCount').get(function () {
    // This will be populated in queries
    return 0;
});
// Pre-save middleware to update lastMessageAt
chatSchema.pre('save', function (next) {
    if (this.lastMessage && !this.lastMessageAt) {
        this.lastMessageAt = new Date();
    }
    next();
});
exports.Message = mongoose_1.default.model('Message', messageSchema);
exports.Chat = mongoose_1.default.model('Chat', chatSchema);
//# sourceMappingURL=chat.model.js.map