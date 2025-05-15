import mongoose, { Schema, Document } from 'mongoose';

export interface ITutor extends Document {
  userId: string;
  name: string;
  email: string;
  bio?: string;
  subjects: string[];
  availability: string[]; // dates or timeslots
  profileImage?: string; 
}

const tutorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: String,
  subjects: [String],
  availability: [Date],
  experience: Number
}, { timestamps: true });

export default mongoose.model('Tutor', tutorSchema);