"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send a chat message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID of the message receiver
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Message content
 *               messageType:
 *                 type: string
 *                 enum: [text, file, image, system]
 *                 default: text
 *               fileUrl:
 *                 type: string
 *                 description: URL of attached file
 *               fileName:
 *                 type: string
 *                 description: Name of attached file
 *               fileSize:
 *                 type: number
 *                 description: Size of attached file in bytes
 *               sessionId:
 *                 type: string
 *                 description: Associated session ID
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Receiver not found
 *       500:
 *         description: Server error
 */
router.post('/message', auth_middleware_1.authenticate, (0, validation_middleware_1.validateRequest)(validation_middleware_1.chatValidation.sendMessage), chat_controller_1.sendChatMessage);
/**
 * @swagger
 * /api/chat/{chatId}/messages:
 *   get:
 *     summary: Get chat messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to retrieve
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages before this timestamp
 *     responses:
 *       200:
 *         description: Chat messages retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:chatId/messages', auth_middleware_1.authenticate, chat_controller_1.getMessages);
/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Get user chats
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Filter by session ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: User chats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth_middleware_1.authenticate, chat_controller_1.getChats);
/**
 * @swagger
 * /api/chat/{chatId}/read:
 *   post:
 *     summary: Mark messages as read
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:chatId/read', auth_middleware_1.authenticate, chat_controller_1.markAsRead);
/**
 * @swagger
 * /api/chat/unread/count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/unread/count', auth_middleware_1.authenticate, chat_controller_1.getUnreadCount);
/**
 * @swagger
 * /api/chat/session/{sessionId}:
 *   get:
 *     summary: Get chat by session ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session chat retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Chat not found for this session
 *       500:
 *         description: Server error
 */
router.get('/session/:sessionId', auth_middleware_1.authenticate, chat_controller_1.getSessionChat);
/**
 * @swagger
 * /api/chat/{chatId}/archive:
 *   post:
 *     summary: Archive a chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat archived successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.post('/:chatId/archive', auth_middleware_1.authenticate, chat_controller_1.archiveUserChat);
/**
 * @swagger
 * /api/chat/stats:
 *   get:
 *     summary: Get chat statistics
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', auth_middleware_1.authenticate, chat_controller_1.getChatStatistics);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map