"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTutors = exports.getTutorById = exports.createOrUpdateTutor = void 0;
const tutor_model_1 = __importDefault(require("../models/tutor.model"));
const User_1 = __importDefault(require("../models/User"));
const createOrUpdateTutor = async (userId, data) => {
    // Verify user exists and is a tutor
    const user = await User_1.default.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (user.role !== 'tutor') {
        throw new Error('User is not a tutor');
    }
    // Include user data if not provided
    const tutorData = {
        ...data,
        userId,
        name: data.name || user.name,
        email: data.email || user.email
    };
    return await tutor_model_1.default.findOneAndUpdate({ userId }, { $set: tutorData }, { new: true, upsert: true, runValidators: true });
};
exports.createOrUpdateTutor = createOrUpdateTutor;
const getTutorById = async (id) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid tutor ID format');
    }
    return await tutor_model_1.default.findById(id).populate('userId', 'name email role');
};
exports.getTutorById = getTutorById;
const getAllTutors = async () => {
    return await tutor_model_1.default.find().populate('userId', 'name email role');
};
exports.getAllTutors = getAllTutors;
//# sourceMappingURL=tutor.service.js.map