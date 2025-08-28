"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatStatistics = exports.archiveUserChat = exports.getSessionChat = exports.getUnreadCount = exports.markAsRead = exports.getChats = exports.getMessages = exports.sendChatMessage = void 0;
const chat_service_1 = require("../services/chat.service");
/**
 * Send a message
 */
const sendChatMessage = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const messageData = {
            senderId: userId,
            receiverId: req.body.receiverId,
            content: req.body.content,
            messageType: req.body.messageType,
            fileUrl: req.body.fileUrl,
            fileName: req.body.fileName,
            fileSize: req.body.fileSize,
            sessionId: req.body.sessionId
        };
        const message = await (0, chat_service_1.sendMessage)(messageData);
        res.status(201).json({
            message: 'Message sent successfully',
            data: message
        });
    }
    catch (err) {
        const statusCode = err.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.sendChatMessage = sendChatMessage;
/**
 * Get chat messages
 */
const getMessages = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const { chatId } = req.params;
        if (!chatId) {
            res.status(400).json({ message: 'Chat ID is required' });
            return;
        }
        const limit = parseInt(req.query.limit) || 50;
        const before = req.query.before ? new Date(req.query.before) : undefined;
        const messages = await (0, chat_service_1.getChatMessages)(chatId, limit, before);
        res.status(200).json({
            messages: messages.reverse(), // Show oldest first
            count: messages.length
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getMessages = getMessages;
/**
 * Get user chats
 */
const getChats = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const filters = {
            userId,
            sessionId: req.query.sessionId,
            isActive: req.query.isActive !== 'false'
        };
        const chats = await (0, chat_service_1.getUserChats)(filters);
        res.status(200).json({
            chats,
            count: chats.length
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getChats = getChats;
/**
 * Mark messages as read
 */
const markAsRead = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const { chatId } = req.params;
        if (!chatId) {
            res.status(400).json({ message: 'Chat ID is required' });
            return;
        }
        await (0, chat_service_1.markMessagesAsRead)(chatId, userId);
        res.status(200).json({
            message: 'Messages marked as read'
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.markAsRead = markAsRead;
/**
 * Get unread message count
 */
const getUnreadCount = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const count = await (0, chat_service_1.getUnreadCount)(userId);
        res.status(200).json({
            unreadCount: count
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getUnreadCount = getUnreadCount;
/**
 * Get chat by session
 */
const getSessionChat = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const { sessionId } = req.params;
        if (!sessionId) {
            res.status(400).json({ message: 'Session ID is required' });
            return;
        }
        const chat = await (0, chat_service_1.getChatBySession)(sessionId);
        if (!chat) {
            res.status(404).json({ message: 'Chat not found for this session' });
            return;
        }
        // Check if user is participant
        if (!chat.participants.some(p => p._id.toString() === userId)) {
            res.status(403).json({ message: 'Access denied to this chat' });
            return;
        }
        res.status(200).json({ chat });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getSessionChat = getSessionChat;
/**
 * Archive chat
 */
const archiveUserChat = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const { chatId } = req.params;
        if (!chatId) {
            res.status(400).json({ message: 'Chat ID is required' });
            return;
        }
        await (0, chat_service_1.archiveChat)(chatId, userId);
        res.status(200).json({
            message: 'Chat archived successfully'
        });
    }
    catch (err) {
        const statusCode = err.message.includes('not found') ? 404 :
            err.message.includes('Access denied') ? 403 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.archiveUserChat = archiveUserChat;
/**
 * Get chat statistics
 */
const getChatStatistics = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const stats = await (0, chat_service_1.getChatStats)(userId);
        res.status(200).json({ stats });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getChatStatistics = getChatStatistics;
//# sourceMappingURL=chat.controller.js.map