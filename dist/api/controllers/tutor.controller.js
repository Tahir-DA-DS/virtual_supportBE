"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProfiles = exports.getProfile = exports.createOrUpdateProfile = void 0;
const tutor_service_1 = require("../services/tutor.service");
const createOrUpdateProfile = async (req, res) => {
    try {
        // Cast to AuthenticatedRequest since this route requires authentication
        const authReq = req;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: missing userId' });
            return;
        }
        const data = req.body;
        const tutor = await (0, tutor_service_1.createOrUpdateTutor)(userId, data);
        res.status(200).json({
            message: 'Profile saved successfully',
            tutor
        });
    }
    catch (err) {
        const statusCode = err.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.createOrUpdateProfile = createOrUpdateProfile;
const getProfile = async (req, res) => {
    try {
        const tutorId = req.params.id;
        // Check if tutorId is provided
        if (!tutorId) {
            res.status(400).json({ message: 'Tutor ID is required' });
            return;
        }
        const tutor = await (0, tutor_service_1.getTutorById)(tutorId);
        if (!tutor) {
            res.status(404).json({ message: 'Tutor not found' });
            return;
        }
        res.status(200).json({ tutor });
    }
    catch (err) {
        const statusCode = err.message.includes('Invalid tutor ID') ? 400 : 500;
        res.status(statusCode).json({
            message: err.message || 'Server error'
        });
    }
};
exports.getProfile = getProfile;
const getAllProfiles = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const tutors = await (0, tutor_service_1.getAllTutors)(limit);
        res.status(200).json({
            count: tutors.length,
            tutors
        });
    }
    catch (err) {
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
};
exports.getAllProfiles = getAllProfiles;
//# sourceMappingURL=tutor.controller.js.map