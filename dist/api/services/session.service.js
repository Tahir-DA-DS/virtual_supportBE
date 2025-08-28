"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionStats = exports.getUpcomingSessions = exports.getSessions = exports.cancelSession = exports.updateSession = exports.getSessionById = exports.createSession = void 0;
const session_model_1 = __importDefault(require("../models/session.model"));
const User_1 = __importDefault(require("../models/User"));
/**
 * Create a new session
 */
const createSession = async (data) => {
    // Validate that both student and tutor exist
    const [student, tutor] = await Promise.all([
        User_1.default.findById(data.studentId),
        User_1.default.findById(data.tutorId)
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
    const conflicts = await session_model_1.default.find({
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
    const session = new session_model_1.default({
        ...data,
        endTime,
        currency: data.currency || 'USD'
    });
    return await session.save();
};
exports.createSession = createSession;
/**
 * Get session by ID
 */
const getSessionById = async (sessionId) => {
    if (!sessionId || !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid session ID');
    }
    return await session_model_1.default.findById(sessionId)
        .populate('studentId', 'name email')
        .populate('tutorId', 'name email');
};
exports.getSessionById = getSessionById;
/**
 * Update session
 */
const updateSession = async (sessionId, data, userId, userRole) => {
    const session = await session_model_1.default.findById(sessionId);
    if (!session) {
        throw new Error('Session not found');
    }
    // Check permissions
    if (userRole === 'admin') {
        // Admin can update anything
    }
    else if (userRole === 'tutor' && session.tutorId.toString() === userId) {
        // Tutor can update their own sessions
    }
    else if (userRole === 'student' && session.studentId.toString() === userId) {
        // Students can only update certain fields
        const allowedFields = ['notes'];
        const updateData = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }
        if (Object.keys(updateData).length === 0) {
            throw new Error('No allowed fields to update');
        }
        Object.assign(session, updateData);
    }
    else {
        throw new Error('Insufficient permissions');
    }
    // If updating time/duration, check for conflicts
    if (data.startTime || data.duration) {
        const startTime = data.startTime || session.startTime;
        const duration = data.duration || session.duration;
        const endTime = new Date(startTime.getTime() + duration * 60000);
        const conflicts = await session_model_1.default.find({
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
    if (data.status !== undefined)
        session.status = data.status;
    if (data.notes !== undefined)
        session.notes = data.notes;
    if (data.meetingLink !== undefined)
        session.meetingLink = data.meetingLink;
    if (data.recordingUrl !== undefined)
        session.recordingUrl = data.recordingUrl;
    if (data.rating !== undefined)
        session.rating = data.rating;
    if (data.review !== undefined)
        session.review = data.review;
    return await session.save();
};
exports.updateSession = updateSession;
/**
 * Cancel session
 */
const cancelSession = async (sessionId, userId, userRole) => {
    const session = await session_model_1.default.findById(sessionId);
    if (!session) {
        throw new Error('Session not found');
    }
    // Check permissions
    if (userRole === 'admin') {
        // Admin can cancel anything
    }
    else if (userRole === 'tutor' && session.tutorId.toString() === userId) {
        // Tutor can cancel their own sessions
    }
    else if (userRole === 'student' && session.studentId.toString() === userId) {
        // Students can cancel their own sessions
    }
    else {
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
exports.cancelSession = cancelSession;
/**
 * Get sessions with filters
 */
const getSessions = async (filters) => {
    const query = {};
    if (filters.studentId)
        query.studentId = filters.studentId;
    if (filters.tutorId)
        query.tutorId = filters.tutorId;
    if (filters.status)
        query.status = filters.status;
    if (filters.subject)
        query.subject = { $regex: filters.subject, $options: 'i' };
    if (filters.startDate || filters.endDate) {
        query.startTime = {};
        if (filters.startDate)
            query.startTime.$gte = filters.startDate;
        if (filters.endDate)
            query.startTime.$lte = filters.endDate;
    }
    return await session_model_1.default.find(query)
        .populate('studentId', 'name email')
        .populate('tutorId', 'name email')
        .sort({ startTime: 1 });
};
exports.getSessions = getSessions;
/**
 * Get upcoming sessions for a user
 */
const getUpcomingSessions = async (userId, userRole) => {
    const query = {
        startTime: { $gte: new Date() },
        status: { $in: ['pending', 'confirmed'] }
    };
    if (userRole === 'student') {
        query.studentId = userId;
    }
    else if (userRole === 'tutor') {
        query.tutorId = userId;
    }
    return await session_model_1.default.find(query)
        .populate('studentId', 'name email')
        .populate('tutorId', 'name email')
        .sort({ startTime: 1 });
};
exports.getUpcomingSessions = getUpcomingSessions;
/**
 * Get session statistics
 */
const getSessionStats = async (userId, userRole) => {
    const matchStage = {};
    if (userRole === 'student') {
        matchStage.studentId = userId;
    }
    else if (userRole === 'tutor') {
        matchStage.tutorId = userId;
    }
    const stats = await session_model_1.default.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalDuration: { $sum: '$duration' },
                totalPrice: { $sum: '$price' }
            }
        }
    ]);
    return stats.reduce((acc, stat) => {
        acc[stat._id] = {
            count: stat.count,
            totalDuration: stat.totalDuration,
            totalPrice: stat.totalPrice
        };
        return acc;
    }, {});
};
exports.getSessionStats = getSessionStats;
//# sourceMappingURL=session.service.js.map