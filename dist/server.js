"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const swagger_1 = require("./utils/swagger");
const db_1 = require("./config/db");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./utils/errorHandler");
const auth_routes_1 = __importDefault(require("./api/routes/auth.routes"));
const tutor_routes_1 = __importDefault(require("./api/routes/tutor.routes"));
const session_routes_1 = __importDefault(require("./api/routes/session.routes"));
const payment_routes_1 = __importDefault(require("./api/routes/payment.routes"));
const chat_routes_1 = __importDefault(require("./api/routes/chat.routes"));
const user_routes_1 = __importDefault(require("./api/routes/user.routes"));
// Load environment variables first
dotenv_1.default.config();
// Validate required environment variables only in non-test environments
if (process.env.NODE_ENV !== 'test') {
    const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`❌ Missing required environment variable: ${envVar}`);
            process.exit(1);
        }
    }
}
const app = (0, express_1.default)();
exports.app = app;
// Middleware
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'https://your-frontend-domain.onrender.com' // Update this with your actual frontend domain
        ];
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Request logging
app.use(logger_1.requestLogger);
// Connect to DB only in non-test environments
if (process.env.NODE_ENV !== 'test') {
    (0, db_1.connectDB)();
}
// Static file serving for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tutors', tutor_routes_1.default);
app.use('/api/sessions', session_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/users', user_routes_1.default);
// Health check
app.get('/', (_req, res) => {
    res.json({
        message: 'Virtual Support API is running...',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// API documentation
(0, swagger_1.setupSwagger)(app);
// Error logging middleware
app.use(logger_1.errorLogger);
// Error handling middleware
app.use((err, _req, res, _next) => {
    const errorInfo = (0, errorHandler_1.handleError)(err);
    res.status(errorInfo.statusCode).json({
        message: errorInfo.message,
        ...(errorInfo.errors && { errors: errorInfo.errors }),
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: errorInfo
        })
    });
});
// 404 handler - catch all unmatched routes
app.use((req, res) => {
    res.status(404).json({
        message: `Route ${req.originalUrl} not found`
    });
});
// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        if (process.env.NODE_ENV === 'production') {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 API Documentation available at /api-docs`);
        }
        else {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
        }
    });
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        server.close(() => {
            console.log('Process terminated');
        });
    });
}
//# sourceMappingURL=server.js.map