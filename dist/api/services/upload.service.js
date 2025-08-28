"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileInfo = exports.validateImageDimensions = exports.deleteFile = exports.getFileUrl = exports.profilePictureUpload = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (_req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
// File filter for images
const fileFilter = (_req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
// Configure multer
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter
});
// Profile picture upload middleware
exports.profilePictureUpload = exports.upload.single('profilePicture');
// Helper function to get file URL
const getFileUrl = (filename) => {
    return `/uploads/${filename}`;
};
exports.getFileUrl = getFileUrl;
// Helper function to delete file
const deleteFile = (filename) => {
    const filePath = path_1.default.join('uploads', filename);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
};
exports.deleteFile = deleteFile;
// Helper function to validate image dimensions
const validateImageDimensions = (_filePath) => {
    return new Promise((resolve, _reject) => {
        // For now, return default dimensions
        // In production, you'd use a library like sharp or jimp to get actual dimensions
        resolve({ width: 400, height: 400 });
    });
};
exports.validateImageDimensions = validateImageDimensions;
// Helper function to get file info
const getFileInfo = (file) => {
    return {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: (0, exports.getFileUrl)(file.filename)
    };
};
exports.getFileInfo = getFileInfo;
//# sourceMappingURL=upload.service.js.map