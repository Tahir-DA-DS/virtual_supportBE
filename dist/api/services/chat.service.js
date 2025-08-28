"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatStats = exports.archiveChat = exports.getChatBySession = exports.getUnreadCount = exports.markMessagesAsRead = exports.getUserChats = exports.getChatMessages = exports.sendMessage = exports.getOrCreateChat = void 0;
const chat_model_1 = require("../models/chat.model");
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Create or get chat between two users
 */
const getOrCreateChat = async (participant1, participant2, sessionId) => {
    // Check if chat already exists
    let chat = await chat_model_1.Chat.findOne({
        participants: { $all: [participant1, participant2] },
        isActive: true
    });
    if (!chat) {
        // Create new chat
        chat = new chat_model_1.Chat({
            participants: [participant1, participant2],
            sessionId: sessionId ? new mongoose_1.default.Types.ObjectId(sessionId) : undefined,
            isActive: true
        });
        await chat.save();
    }
    else if (sessionId && !chat.sessionId) {
        // Update existing chat with session ID
        chat.sessionId = new mongoose_1.default.Types.ObjectId(sessionId);
        await chat.save();
    }
    return chat;
};
exports.getOrCreateChat = getOrCreateChat;
/**
 * Send a message
 */
const sendMessage = async (data) => {
    // Validate that both users exist
    const [sender, receiver] = await Promise.all([
        User_1.default.findById(data.senderId),
        User_1.default.findById(data.receiverId)
    ]);
    if (!sender) {
        throw new Error('Sender not found');
    }
    if (!receiver) {
        throw new Error('Receiver not found');
    }
    // Get or create chat
    const chat = await (0, exports.getOrCreateChat)(data.senderId, data.receiverId, data.sessionId);
    // Create message
    const message = new chat_model_1.Message({
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        messageType: data.messageType || 'text',
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize
    });
    await message.save();
    // Update chat with last message
    chat.lastMessage = message._id;
    chat.lastMessageAt = new Date();
    await chat.save();
    return message;
};
exports.sendMessage = sendMessage;
/**
 * Get chat messages
 */
const getChatMessages = async (chatId, limit = 50, before) => {
    // First get the chat to find participants
    const chat = await chat_model_1.Chat.findById(chatId);
    if (!chat) {
        throw new Error('Chat not found');
    }
    const query = {
        $or: [
            { senderId: { $in: chat.participants } },
            { receiverId: { $in: chat.participants } }
        ]
    };
    if (before) {
        query.createdAt = { $lt: before };
    }
    return await chat_model_1.Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email');
};
exports.getChatMessages = getChatMessages;
/**
 * Get user chats
 */
const getUserChats = async (filters) => {
    const query = {
        participants: filters.userId,
        isActive: true
    };
    if (filters.sessionId) {
        query.sessionId = filters.sessionId;
    }
    if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
    }
    return await chat_model_1.Chat.find(query)
        .populate('participants', 'name email')
        .populate('lastMessage')
        .populate('sessionId', 'subject startTime')
        .sort({ lastMessageAt: -1 });
};
exports.getUserChats = getUserChats;
/**
 * Mark messages as read
 */
const markMessagesAsRead = async (chatId, userId) => {
    // First get the chat to find participants
    const chat = await chat_model_1.Chat.findById(chatId);
    if (!chat) {
        throw new Error('Chat not found');
    }
    await chat_model_1.Message.updateMany({
        receiverId: userId,
        isRead: false,
        $or: [
            { senderId: { $in: chat.participants } },
            { receiverId: { $in: chat.participants } }
        ]
    }, {
        isRead: true,
        readAt: new Date()
    });
};
exports.markMessagesAsRead = markMessagesAsRead;
/**
 * Get unread message count
 */
const getUnreadCount = async (userId) => {
    return await chat_model_1.Message.countDocuments({
        receiverId: userId,
        isRead: false
    });
};
exports.getUnreadCount = getUnreadCount;
/**
 * Get chat by session ID
 */
const getChatBySession = async (sessionId) => {
    return await chat_model_1.Chat.findOne({ sessionId, isActive: true })
        .populate('participants', 'name email')
        .populate('lastMessage')
        .populate('sessionId', 'subject startTime');
};
exports.getChatBySession = getChatBySession;
/**
 * Archive chat
 */
const archiveChat = async (chatId, userId) => {
    const chat = await chat_model_1.Chat.findById(chatId);
    if (!chat) {
        throw new Error('Chat not found');
    }
    if (!chat.participants.includes(userId)) {
        throw new Error('Access denied to this chat');
    }
    chat.isActive = false;
    await chat.save();
};
exports.archiveChat = archiveChat;
/**
 * Get chat statistics
 */
const getChatStats = async (userId) => {
    const totalChats = await chat_model_1.Chat.countDocuments({
        participants: userId,
        isActive: true
    });
    const totalMessages = await chat_model_1.Message.countDocuments({
        $or: [
            { senderId: userId },
            { receiverId: userId }
        ]
    });
    const unreadMessages = await chat_model_1.Message.countDocuments({
        receiverId: userId,
        isRead: false
    });
    return {
        totalChats,
        totalMessages,
        unreadMessages
    };
};
exports.getChatStats = getChatStats;
//# sourceMappingURL=chat.service.js.map