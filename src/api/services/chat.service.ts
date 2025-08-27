import { Message, Chat, IMessage, IChat } from '../models/chat.model';
import { Session } from '../models/session.model';
import User from '../models/User';

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
export const getOrCreateChat = async (participant1: string, participant2: string, sessionId?: string): Promise<IChat> => {
  // Check if chat already exists
  let chat = await Chat.findOne({
    participants: { $all: [participant1, participant2] },
    isActive: true
  });

  if (!chat) {
    // Create new chat
    chat = new Chat({
      participants: [participant1, participant2],
      sessionId,
      isActive: true
    });
    await chat.save();
  } else if (sessionId && !chat.sessionId) {
    // Update existing chat with session ID
    chat.sessionId = sessionId;
    await chat.save();
  }

  return chat;
};

/**
 * Send a message
 */
export const sendMessage = async (data: CreateMessageData): Promise<IMessage> => {
  // Validate that both users exist
  const [sender, receiver] = await Promise.all([
    User.findById(data.senderId),
    User.findById(data.receiverId)
  ]);

  if (!sender) {
    throw new Error('Sender not found');
  }

  if (!receiver) {
    throw new Error('Receiver not found');
  }

  // Get or create chat
  const chat = await getOrCreateChat(data.senderId, data.receiverId, data.sessionId);

  // Create message
  const message = new Message({
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

/**
 * Get chat messages
 */
export const getChatMessages = async (chatId: string, limit: number = 50, before?: Date): Promise<IMessage[]> => {
  const query: any = {};
  
  if (before) {
    query.createdAt = { $lt: before };
  }

  return await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email');
};

/**
 * Get user chats
 */
export const getUserChats = async (filters: ChatFilters): Promise<IChat[]> => {
  const query: any = {
    participants: filters.userId,
    isActive: true
  };

  if (filters.sessionId) {
    query.sessionId = filters.sessionId;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  return await Chat.find(query)
    .populate('participants', 'name email')
    .populate('lastMessage')
    .populate('sessionId', 'subject startTime')
    .sort({ lastMessageAt: -1 });
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  await Message.updateMany(
    {
      receiverId: userId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  return await Message.countDocuments({
    receiverId: userId,
    isRead: false
  });
};

/**
 * Get chat by session ID
 */
export const getChatBySession = async (sessionId: string): Promise<IChat | null> => {
  return await Chat.findOne({ sessionId, isActive: true })
    .populate('participants', 'name email')
    .populate('lastMessage')
    .populate('sessionId', 'subject startTime');
};

/**
 * Archive chat
 */
export const archiveChat = async (chatId: string, userId: string): Promise<void> => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error('Chat not found');
  }

  if (!chat.participants.includes(userId)) {
    throw new Error('Access denied to this chat');
  }

  chat.isActive = false;
  await chat.save();
};

/**
 * Get chat statistics
 */
export const getChatStats = async (userId: string): Promise<any> => {
  const totalChats = await Chat.countDocuments({
    participants: userId,
    isActive: true
  });

  const totalMessages = await Message.countDocuments({
    $or: [
      { senderId: userId },
      { receiverId: userId }
    ]
  });

  const unreadMessages = await Message.countDocuments({
    receiverId: userId,
    isRead: false
  });

  return {
    totalChats,
    totalMessages,
    unreadMessages
  };
};
