import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChat extends mongoose.Document {
  participants: mongoose.Types.ObjectId[];
  sessionId?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
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

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
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
chatSchema.virtual('unreadCount').get(function(this: any) {
  // This will be populated in queries
  return 0;
});

// Pre-save middleware to update lastMessageAt
chatSchema.pre('save', function(this: any, next) {
  if (this.lastMessage && !this.lastMessageAt) {
    this.lastMessageAt = new Date();
  }
  next();
});

export const Message = mongoose.model<IMessage>('Message', messageSchema);
export const Chat = mongoose.model<IChat>('Chat', chatSchema);
