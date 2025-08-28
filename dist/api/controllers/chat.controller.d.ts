import { Request, Response } from 'express';
/**
 * Send a message
 */
export declare const sendChatMessage: (req: Request, res: Response) => Promise<void>;
/**
 * Get chat messages
 */
export declare const getMessages: (req: Request, res: Response) => Promise<void>;
/**
 * Get user chats
 */
export declare const getChats: (req: Request, res: Response) => Promise<void>;
/**
 * Mark messages as read
 */
export declare const markAsRead: (req: Request, res: Response) => Promise<void>;
/**
 * Get unread message count
 */
export declare const getUnreadCount: (req: Request, res: Response) => Promise<void>;
/**
 * Get chat by session
 */
export declare const getSessionChat: (req: Request, res: Response) => Promise<void>;
/**
 * Archive chat
 */
export declare const archiveUserChat: (req: Request, res: Response) => Promise<void>;
/**
 * Get chat statistics
 */
export declare const getChatStatistics: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map