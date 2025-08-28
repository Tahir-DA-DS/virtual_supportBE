import { IMessage, IChat } from '../models/chat.model';
export interface CreateMessageData {
    senderId: string;
    receiverId: string;
    content: string;
    messageType?: 'text' | 'file' | 'image' | 'system';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    sessionId?: string;
}
export interface ChatFilters {
    userId: string;
    sessionId?: string;
    isActive?: boolean;
}
/**
 * Create or get chat between two users
 */
export declare const getOrCreateChat: (participant1: string, participant2: string, sessionId?: string) => Promise<IChat>;
/**
 * Send a message
 */
export declare const sendMessage: (data: CreateMessageData) => Promise<IMessage>;
/**
 * Get chat messages
 */
export declare const getChatMessages: (chatId: string, limit?: number, before?: Date) => Promise<IMessage[]>;
/**
 * Get user chats
 */
export declare const getUserChats: (filters: ChatFilters) => Promise<IChat[]>;
/**
 * Mark messages as read
 */
export declare const markMessagesAsRead: (chatId: string, userId: string) => Promise<void>;
/**
 * Get unread message count
 */
export declare const getUnreadCount: (userId: string) => Promise<number>;
/**
 * Get chat by session ID
 */
export declare const getChatBySession: (sessionId: string) => Promise<IChat | null>;
/**
 * Archive chat
 */
export declare const archiveChat: (chatId: string, userId: string) => Promise<void>;
/**
 * Get chat statistics
 */
export declare const getChatStats: (userId: string) => Promise<any>;
//# sourceMappingURL=chat.service.d.ts.map