import mongoose from 'mongoose';
export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'tutor' | 'admin';
    profilePicture?: string;
    bio?: string;
    phone?: string;
    dateOfBirth?: Date;
    location?: string;
    timezone?: string;
    skills?: string[];
    certifications?: Array<{
        name: string;
        issuer: string;
        issueDate: Date;
        expiryDate?: Date;
        credentialId?: string;
        credentialUrl?: string;
    }>;
    education?: Array<{
        degree: string;
        institution: string;
        graduationYear: number;
        fieldOfStudy: string;
        gpa?: number;
    }>;
    rating?: number;
    totalRatings: number;
    totalSessions: number;
    isVerified: boolean;
    isActive: boolean;
    lastActive: Date;
    preferences?: {
        subjects?: string[];
        availability?: string[];
        maxPrice?: number;
        currency?: string;
        language?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map