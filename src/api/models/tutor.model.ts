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

const TutorSchema = new Schema<ITutor>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: { type: String },
  subjects: [{ type: String }],
  availability: [{ type: String }],
  profileImage: { type: String },
}, { timestamps: true });

export const Tutor = mongoose.model<ITutor>('Tutor', TutorSchema);