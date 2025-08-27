import mongoose, { Schema, Document } from 'mongoose';

export interface ITutor extends Document {
  userId: string;
  name: string;
  email: string;
  bio?: string;
  subjects: string[];
  availability: string[]; // dates or timeslots
  profileImage?: string;
  experience?: number;
}

const tutorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  bio: String,
  subjects: [String],
  availability: [String], // Changed from [Date] to [String] to match interface
  profileImage: String,
  experience: Number
}, { timestamps: true });

export default mongoose.model<ITutor>('Tutor', tutorSchema);