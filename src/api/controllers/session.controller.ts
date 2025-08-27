import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import {
  createSession,
  getSessionById,
  updateSession,
  cancelSession,
  getSessions,
  getUpcomingSessions,
  getSessionStats,
  CreateSessionData,
  UpdateSessionData,
  SessionFilters
} from '../services/session.service';

/**
 * Create a new session
 */
export const createNewSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (userRole !== 'student') {
      res.status(403).json({ message: 'Only students can book sessions' });
      return;
    }

    const sessionData: CreateSessionData = {
      studentId: userId,
      tutorId: req.body.tutorId,
      subject: req.body.subject,
      startTime: new Date(req.body.startTime),
      duration: req.body.duration,
      sessionType: req.body.sessionType || 'one-on-one',
      price: req.body.price,
      currency: req.body.currency,
      notes: req.body.notes
    };

    const session = await createSession(sessionData);
    
    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (err: any) {
    const statusCode = err.message.includes('not found') ? 404 : 
                      err.message.includes('conflict') ? 409 : 
                      err.message.includes('not a tutor') ? 400 : 500;
    
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get session by ID
 */
export const getSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionId = req.params.id;
    
    if (!sessionId) {
      res.status(400).json({ message: 'Session ID is required' });
      return;
    }

    const session = await getSessionById(sessionId);
    
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    res.status(200).json({ session });
  } catch (err: any) {
    const statusCode = err.message.includes('Invalid session ID') ? 400 : 500;
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Update session
 */
export const updateSessionDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const sessionId = req.params.id;
    
    if (!sessionId) {
      res.status(400).json({ message: 'Session ID is required' });
      return;
    }

    const updateData: UpdateSessionData = {};
    
    if (req.body.startTime) updateData.startTime = new Date(req.body.startTime);
    if (req.body.duration) updateData.duration = req.body.duration;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.notes) updateData.notes = req.body.notes;
    if (req.body.meetingLink) updateData.meetingLink = req.body.meetingLink;
    if (req.body.recordingUrl) updateData.recordingUrl = req.body.recordingUrl;
    if (req.body.rating) updateData.rating = req.body.rating;
    if (req.body.review) updateData.review = req.body.review;

    const session = await updateSession(sessionId, updateData, userId, userRole);
    
    res.status(200).json({
      message: 'Session updated successfully',
      session
    });
  } catch (err: any) {
    const statusCode = err.message.includes('not found') ? 404 : 
                      err.message.includes('conflict') ? 409 : 
                      err.message.includes('permissions') ? 403 : 
                      err.message.includes('allowed fields') ? 400 : 500;
    
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Cancel session
 */
export const cancelSessionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const sessionId = req.params.id;
    
    if (!sessionId) {
      res.status(400).json({ message: 'Session ID is required' });
      return;
    }

    const session = await cancelSession(sessionId, userId, userRole);
    
    res.status(200).json({
      message: 'Session cancelled successfully',
      session
    });
  } catch (err: any) {
    const statusCode = err.message.includes('not found') ? 404 : 
                      err.message.includes('permissions') ? 403 : 
                      err.message.includes('Cannot cancel') ? 400 : 500;
    
    res.status(statusCode).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get sessions with filters
 */
export const getSessionsList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters: SessionFilters = {};
    
    if (req.query.studentId) filters.studentId = req.query.studentId as string;
    if (req.query.tutorId) filters.tutorId = req.query.tutorId as string;
    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.subject) filters.subject = req.query.subject as string;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    const sessions = await getSessions(filters);
    
    res.status(200).json({
      sessions,
      count: sessions.length
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get upcoming sessions for authenticated user
 */
export const getMyUpcomingSessions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const sessions = await getUpcomingSessions(userId, userRole);
    
    res.status(200).json({
      sessions,
      count: sessions.length
    });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};

/**
 * Get session statistics for authenticated user
 */
export const getMySessionStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const stats = await getSessionStats(userId, userRole);
    
    res.status(200).json({ stats });
  } catch (err: any) {
    res.status(500).json({ 
      message: err.message || 'Server error' 
    });
  }
};
