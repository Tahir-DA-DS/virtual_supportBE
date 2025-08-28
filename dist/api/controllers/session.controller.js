"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMySessionStats = exports.getMyUpcomingSessions = exports.getSessionsList = exports.cancelSessionById = exports.updateSessionDetails = exports.getSession = exports.createNewSession = void 0;
const session_service_1 = require("../services/session.service");
/**
 * Create a new session
 */
const createNewSession = async (req, res) => {
    try {
        const authReq = req;
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
        const sessionData = {
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
        const session = await (0, session_service_1.createSession)(sessionData);
        res.status(201).json({
            message: 'Session created successfully',
            session
        });
    }
    catch (err) {
        const statusCode = err.message.includes('not found') ? 404 :
            err.message.includes('conflict') ? 409 :
                err.message.includes('not a tutor') ? 400 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.createNewSession = createNewSession;
/**
 * Get session by ID
 */
const getSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        if (!sessionId) {
            res.status(400).json({ message: 'Session ID is required' });
            return;
        }
        const session = await (0, session_service_1.getSessionById)(sessionId);
        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }
        res.status(200).json({ session });
    }
    catch (err) {
        const statusCode = err.message.includes('Invalid session ID') ? 400 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getSession = getSession;
/**
 * Update session
 */
const updateSessionDetails = async (req, res) => {
    try {
        const authReq = req;
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
        const updateData = {};
        if (req.body.startTime)
            updateData.startTime = new Date(req.body.startTime);
        if (req.body.duration)
            updateData.duration = req.body.duration;
        if (req.body.status)
            updateData.status = req.body.status;
        if (req.body.notes)
            updateData.notes = req.body.notes;
        if (req.body.meetingLink)
            updateData.meetingLink = req.body.meetingLink;
        if (req.body.recordingUrl)
            updateData.recordingUrl = req.body.recordingUrl;
        if (req.body.rating)
            updateData.rating = req.body.rating;
        if (req.body.review)
            updateData.review = req.body.review;
        const session = await (0, session_service_1.updateSession)(sessionId, updateData, userId, userRole);
        res.status(200).json({
            message: 'Session updated successfully',
            session
        });
    }
    catch (err) {
        const statusCode = err.message.includes('not found') ? 404 :
            err.message.includes('conflict') ? 409 :
                err.message.includes('permissions') ? 403 :
                    err.message.includes('allowed fields') ? 400 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.updateSessionDetails = updateSessionDetails;
/**
 * Cancel session
 */
const cancelSessionById = async (req, res) => {
    try {
        const authReq = req;
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
        const session = await (0, session_service_1.cancelSession)(sessionId, userId, userRole);
        res.status(200).json({
            message: 'Session cancelled successfully',
            session
        });
    }
    catch (err) {
        const statusCode = err.message.includes('not found') ? 404 :
            err.message.includes('permissions') ? 403 :
                err.message.includes('Cannot cancel') ? 400 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.cancelSessionById = cancelSessionById;
/**
 * Get sessions with filters
 */
const getSessionsList = async (req, res) => {
    try {
        const filters = {};
        if (req.query.studentId)
            filters.studentId = req.query.studentId;
        if (req.query.tutorId)
            filters.tutorId = req.query.tutorId;
        if (req.query.status)
            filters.status = req.query.status;
        if (req.query.subject)
            filters.subject = req.query.subject;
        if (req.query.startDate)
            filters.startDate = new Date(req.query.startDate);
        if (req.query.endDate)
            filters.endDate = new Date(req.query.endDate);
        const sessions = await (0, session_service_1.getSessions)(filters);
        res.status(200).json({
            sessions,
            count: sessions.length
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getSessionsList = getSessionsList;
/**
 * Get upcoming sessions for authenticated user
 */
const getMyUpcomingSessions = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        const userRole = authReq.user?.role;
        if (!userId || !userRole) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const sessions = await (0, session_service_1.getUpcomingSessions)(userId, userRole);
        res.status(200).json({
            sessions,
            count: sessions.length
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getMyUpcomingSessions = getMyUpcomingSessions;
/**
 * Get session statistics for authenticated user
 */
const getMySessionStats = async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        const userRole = authReq.user?.role;
        if (!userId || !userRole) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const stats = await (0, session_service_1.getSessionStats)(userId, userRole);
        res.status(200).json({ stats });
    }
    catch (err) {
        res.status(500).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getMySessionStats = getMySessionStats;
//# sourceMappingURL=session.controller.js.map