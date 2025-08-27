import mongoose from 'mongoose';

export interface ISession extends mongoose.Document {
  studentId: mongoose.Types.ObjectId;
  tutorId: mongoose.Types.ObjectId;
  subject: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  sessionType: 'one-on-one' | 'group' | 'exam-prep' | 'homework-help';
  price: number;
  currency: string;
  notes?: string;
  meetingLink?: string;
  recordingUrl?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
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
sessionSchema.virtual('isPast').get(function(this: any) {
  return new Date() > this.endTime;
});

// Virtual for checking if session is happening now
sessionSchema.virtual('isNow').get(function(this: any) {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
});

// Pre-save middleware to calculate endTime if not provided
sessionSchema.pre('save', function(this: any, next) {
  if (this.startTime && this.duration && !this.endTime) {
    this.endTime = new Date(this.startTime.getTime() + this.duration * 60000);
  }
  next();
});

export default mongoose.model<ISession>('Session', sessionSchema);
