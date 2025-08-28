import mongoose from 'mongoose';
export interface ISession extends mongoose.Document {
    studentId: mongoose.Types.ObjectId;
    tutorId: mongoose.Types.ObjectId;
    subject: string;
    startTime: Date;
    endTime: Date;
    duration: number;
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
declare const _default: mongoose.Model<ISession, {}, {}, {}, mongoose.Document<unknown, {}, ISession, {}, {}> & ISession & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=session.model.d.ts.map