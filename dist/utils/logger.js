"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = exports.logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || LogLevel.INFO;
    }
    shouldLog(level) {
        const levels = Object.values(LogLevel);
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex <= currentLevelIndex;
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
    }
    error(message, meta) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage(LogLevel.ERROR, message, meta));
        }
    }
    warn(message, meta) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage(LogLevel.WARN, message, meta));
        }
    }
    info(message, meta) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage(LogLevel.INFO, message, meta));
        }
    }
    debug(message, meta) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
        }
    }
}
exports.logger = new Logger();
// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent') || 'Unknown',
            ip: req.ip || req.connection.remoteAddress || 'Unknown'
        };
        if (res.statusCode >= 400) {
            exports.logger.error(`${req.method} ${req.originalUrl} - ${res.statusCode}`, logData);
        }
        else {
            exports.logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, logData);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
// Error logging middleware
const errorLogger = (error, req, _res, next) => {
    exports.logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user?.id || 'Unknown'
    });
    next(error);
};
exports.errorLogger = errorLogger;
//# sourceMappingURL=logger.js.map