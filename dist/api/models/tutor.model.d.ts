import mongoose from 'mongoose';
export interface ITutor extends mongoose.Document {
    userId: string;
    name: string;
    email: string;
    bio?: string;
    subjects: string[];
    availability: string[];
    profileImage?: string;
    experience?: number;
}
declare const _default: mongoose.Model<ITutor, {}, {}, {}, mongoose.Document<unknown, {}, ITutor, {}, {}> & ITutor & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=tutor.model.d.ts.map