import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import {
  sendMessage,
  getChatMessages,
  getUserChats,
  markMessagesAsRead,
  getUnreadCount as getUnreadCountService,
  getChatBySession,
  archiveChat,
  getChatStats,
  CreateMessageData
} from '../services/chat.service';

/**
 * Send a message
 */
export const sendChatMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const messageData: CreateMessageData = {
      senderId: userId,
      receiverId: req.body.receiverId,
      content: req.body.content,
      messageType: req.body.messageType,
      fileUrl: req.body.fileUrl,
      fileName: req.body.fileName,
      fileSize: req.body.fileSize,
      sessionId: req.body.sessionId
    };

    const message = await sendMessage(messageData);
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (err: any) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get chat messages
 */
export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
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
    
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before ? new Date(req.query.before as string) : undefined;

    const messages = await getChatMessages(chatId, limit, before);
    
    res.status(200).json({
      messages: messages.reverse(), // Show oldest first
      count: messages.length
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get user chats
 */
export const getChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const filters = {
      userId,
      sessionId: req.query.sessionId as string,
      isActive: req.query.isActive !== 'false'
    };

    const chats = await getUserChats(filters);
    
    res.status(200).json({
      chats,
      count: chats.length
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
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
    
    await markMessagesAsRead(chatId, userId);
    
    res.status(200).json({
      message: 'Messages marked as read'
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const count = await getUnreadCountService(userId);
    
    res.status(200).json({
      unreadCount: count
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get chat by session
 */
export const getSessionChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
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
    
    const chat = await getChatBySession(sessionId);
    
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
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Archive chat
 */
export const archiveUserChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
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
    
    await archiveChat(chatId, userId);
    
    res.status(200).json({
      message: 'Chat archived successfully'
    });
  } catch (err: any) {
    const statusCode = err.message.includes('not found') ? 404 : 
                      err.message.includes('Access denied') ? 403 : 500;
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get chat statistics
 */
export const getChatStatistics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const stats = await getChatStats(userId);
    
    res.status(200).json({ stats });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};
