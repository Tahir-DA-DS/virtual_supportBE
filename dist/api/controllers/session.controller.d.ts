import { Request, Response } from 'express';
/**
 * Create a new session
 */
export declare const createNewSession: (req: Request, res: Response) => Promise<void>;
/**
 * Get session by ID
 */
export declare const getSession: (req: Request, res: Response) => Promise<void>;
/**
 * Update session
 */
export declare const updateSessionDetails: (req: Request, res: Response) => Promise<void>;
/**
 * Cancel session
 */
export declare const cancelSessionById: (req: Request, res: Response) => Promise<void>;
/**
 * Get sessions with filters
 */
export declare const getSessionsList: (req: Request, res: Response) => Promise<void>;
/**
 * Get upcoming sessions for authenticated user
 */
export declare const getMyUpcomingSessions: (req: Request, res: Response) => Promise<void>;
/**
 * Get session statistics for authenticated user
 */
export declare const getMySessionStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=session.controller.d.ts.map