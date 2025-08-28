"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tutorSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    bio: String,
    subjects: [String],
    availability: [String], // Changed from [Date] to [String] to match interface
    profileImage: String,
    experience: Number
}, { timestamps: true });
exports.default = mongoose_1.default.model('Tutor', tutorSchema);
//# sourceMappingURL=tutor.model.js.map