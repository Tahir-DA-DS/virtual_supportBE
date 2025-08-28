import { ITutor } from '../models/tutor.model';
export interface TutorData {
    name?: string;
    email?: string;
    bio?: string;
    subjects?: string[];
    availability?: string[];
    profileImage?: string;
    experience?: number;
}
export declare const createOrUpdateTutor: (userId: string, data: TutorData) => Promise<ITutor>;
export declare const getTutorById: (id: string) => Promise<ITutor | null>;
export declare const getAllTutors: (limit?: number) => Promise<ITutor[]>;
//# sourceMappingURL=tutor.service.d.ts.map