import { ISession } from '../models/session.model';
export interface CreateSessionData {
    studentId: string;
    tutorId: string;
    subject: string;
    startTime: Date;
    duration: number;
    sessionType: 'one-on-one' | 'group' | 'exam-prep' | 'homework-help';
    price: number;
    currency?: string;
    notes?: string;
}
export interface UpdateSessionData {
    startTime?: Date;
    duration?: number;
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
    notes?: string;
    meetingLink?: string;
    recordingUrl?: string;
    rating?: number;
    review?: string;
}
export interface SessionFilters {
    studentId?: string;
    tutorId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    subject?: string;
}
/**
 * Create a new session
 */
export declare const createSession: (data: CreateSessionData) => Promise<ISession>;
/**
 * Get session by ID
 */
export declare const getSessionById: (sessionId: string) => Promise<ISession | null>;
/**
 * Update session
 */
export declare const updateSession: (sessionId: string, data: UpdateSessionData, userId: string, userRole: string) => Promise<ISession>;
/**
 * Cancel session
 */
export declare const cancelSession: (sessionId: string, userId: string, userRole: string) => Promise<ISession>;
/**
 * Get sessions with filters
 */
export declare const getSessions: (filters: SessionFilters) => Promise<ISession[]>;
/**
 * Get upcoming sessions for a user
 */
export declare const getUpcomingSessions: (userId: string, userRole: string) => Promise<ISession[]>;
/**
 * Get session statistics
 */
export declare const getSessionStats: (userId: string, userRole: string) => Promise<any>;
//# sourceMappingURL=session.service.d.ts.map