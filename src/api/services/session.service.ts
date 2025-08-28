import Session, { ISession } from '../models/session.model';
import User from '../models/User';

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
export const createSession = async (data: CreateSessionData): Promise<ISession> => {
  // Validate that both student and tutor exist
  const [student, tutor] = await Promise.all([
    User.findById(data.studentId),
    User.findById(data.tutorId)
  ]);

  if (!student) {
    throw new Error('Student not found');
  }

  if (!tutor) {
    throw new Error('Tutor not found');
  }

  if (tutor.role !== 'tutor') {
    throw new Error('User is not a tutor');
  }

  if (student.role !== 'student') {
    throw new Error('User is not a student');
  }

  // Check for scheduling conflicts
  const endTime = new Date(data.startTime.getTime() + data.duration * 60000);
  
  const conflicts = await Session.find({
    $or: [
      { studentId: data.studentId },
      { tutorId: data.tutorId }
    ],
    status: { $in: ['pending', 'confirmed'] },
    $and: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: data.startTime }
      }
    ]
  });

  if (conflicts.length > 0) {
    throw new Error('Scheduling conflict detected');
  }

  // Create the session
  const session = new Session({
    ...data,
    endTime,
    currency: data.currency || 'USD'
  });

  return await session.save();
};

/**
 * Get session by ID
 */
export const getSessionById = async (sessionId: string): Promise<ISession | null> => {
  if (!sessionId || !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error('Invalid session ID');
  }

  return await Session.findById(sessionId)
    .populate('studentId', 'name email')
    .populate('tutorId', 'name email');
};

/**
 * Update session
 */
export const updateSession = async (
  sessionId: string, 
  data: UpdateSessionData,
  userId: string,
  userRole: string
): Promise<ISession> => {
  const session = await Session.findById(sessionId);
  
  if (!session) {
    throw new Error('Session not found');
  }

  // Check permissions
  if (userRole === 'admin') {
    // Admin can update anything
  } else if (userRole === 'tutor' && session.tutorId.toString() === userId) {
    // Tutor can update their own sessions
  } else if (userRole === 'student' && session.studentId.toString() === userId) {
    // Students can only update certain fields
    const allowedFields = ['notes'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (data[field as keyof UpdateSessionData] !== undefined) {
        updateData[field] = data[field as keyof UpdateSessionData];
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No allowed fields to update');
    }
    
    Object.assign(session, updateData);
  } else {
    throw new Error('Insufficient permissions');
  }

  // If updating time/duration, check for conflicts
  if (data.startTime || data.duration) {
    const startTime = data.startTime || session.startTime;
    const duration = data.duration || session.duration;
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    const conflicts = await Session.find({
      _id: { $ne: sessionId },
      $or: [
        { studentId: session.studentId },
        { tutorId: session.tutorId }
      ],
      status: { $in: ['pending', 'confirmed'] },
      $and: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflicts.length > 0) {
      throw new Error('Scheduling conflict detected');
    }

    session.startTime = startTime;
    session.duration = duration;
    session.endTime = endTime;
  }

  // Update other fields
  if (data.status !== undefined) session.status = data.status;
  if (data.notes !== undefined) session.notes = data.notes;
  if (data.meetingLink !== undefined) session.meetingLink = data.meetingLink;
  if (data.recordingUrl !== undefined) session.recordingUrl = data.recordingUrl;
  if (data.rating !== undefined) session.rating = data.rating;
  if (data.review !== undefined) session.review = data.review;

  return await session.save();
};

/**
 * Cancel session
 */
export const cancelSession = async (
  sessionId: string,
  userId: string,
  userRole: string
): Promise<ISession> => {
  const session = await Session.findById(sessionId);
  
  if (!session) {
    throw new Error('Session not found');
  }

  // Check permissions
  if (userRole === 'admin') {
    // Admin can cancel anything
  } else if (userRole === 'tutor' && session.tutorId.toString() === userId) {
    // Tutor can cancel their own sessions
  } else if (userRole === 'student' && session.studentId.toString() === userId) {
    // Students can cancel their own sessions
  } else {
    throw new Error('Insufficient permissions');
  }

  // Check if session can be cancelled
  if (session.status === 'completed') {
    throw new Error('Cannot cancel completed session');
  }

  if (session.status === 'cancelled') {
    throw new Error('Session is already cancelled');
  }

  // Check cancellation policy (within 24 hours)
  const now = new Date();
  const hoursUntilSession = (session.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilSession < 24) {
    throw new Error('Cannot cancel session within 24 hours');
  }

  session.status = 'cancelled';
  return await session.save();
};

/**
 * Get sessions with filters
 */
export const getSessions = async (filters: SessionFilters): Promise<ISession[]> => {
  const query: any = {};

  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.tutorId) query.tutorId = filters.tutorId;
  if (filters.status) query.status = filters.status;
  if (filters.subject) query.subject = { $regex: filters.subject, $options: 'i' };

  if (filters.startDate || filters.endDate) {
    query.startTime = {};
    if (filters.startDate) query.startTime.$gte = filters.startDate;
    if (filters.endDate) query.startTime.$lte = filters.endDate;
  }

  return await Session.find(query)
    .populate('studentId', 'name email')
    .populate('tutorId', 'name email')
    .sort({ startTime: 1 });
};

/**
 * Get upcoming sessions for a user
 */
export const getUpcomingSessions = async (userId: string, userRole: string): Promise<ISession[]> => {
  const query: any = {
    startTime: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  };

  if (userRole === 'student') {
    query.studentId = userId;
  } else if (userRole === 'tutor') {
    query.tutorId = userId;
  }

  return await Session.find(query)
    .populate('studentId', 'name email')
    .populate('tutorId', 'name email')
    .sort({ startTime: 1 });
};

/**
 * Get session statistics
 */
export const getSessionStats = async (userId: string, userRole: string): Promise<{
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  upcoming: number;
}> => {
  const matchStage: any = {};
  
  if (userRole === 'student') {
    matchStage.studentId = userId;
  } else if (userRole === 'tutor') {
    matchStage.tutorId = userId;
  }

  // Get all sessions for the user
  const allSessions = await Session.find(matchStage);
  
  // Get upcoming sessions (pending + confirmed, starting from now)
  const upcomingSessions = allSessions.filter(session => 
    session.status === 'pending' || session.status === 'confirmed'
  ).filter(session => session.startTime >= new Date());

  // Count by status
  const stats = {
    total: allSessions.length,
    completed: allSessions.filter(s => s.status === 'completed').length,
    pending: allSessions.filter(s => s.status === 'pending').length,
    cancelled: allSessions.filter(s => s.status === 'cancelled').length,
    upcoming: upcomingSessions.length
  };

  return stats;
};
