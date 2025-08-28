"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevenueAnalytics = exports.getSessionAnalytics = exports.getUserAnalytics = exports.getDashboardStats = void 0;
const chat_model_1 = require("../models/chat.model");
const User_1 = __importDefault(require("../models/User"));
const session_model_1 = __importDefault(require("../models/session.model"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
/**
 * Get comprehensive dashboard statistics
 */
const getDashboardStats = async () => {
    const [totalUsers, totalSessions, totalRevenue, activeChats, userGrowth, sessionStats, revenueStats, topTutors, popularSubjects] = await Promise.all([
        User_1.default.countDocuments({ isActive: true }),
        session_model_1.default.countDocuments(),
        payment_model_1.default.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0),
        chat_model_1.Chat.countDocuments({ isActive: true }),
        getUserGrowth(),
        getSessionStats(),
        getRevenueStats(),
        getTopTutors(),
        getPopularSubjects()
    ]);
    return {
        totalUsers,
        totalSessions,
        totalRevenue,
        activeChats,
        userGrowth,
        sessionStats,
        revenueStats,
        topTutors,
        popularSubjects
    };
};
exports.getDashboardStats = getDashboardStats;
/**
 * Get user analytics
 */
const getUserAnalytics = async () => {
    const [totalStudents, totalTutors, verifiedTutors, activeUsers, newUsersThisMonth, userRetentionRate] = await Promise.all([
        User_1.default.countDocuments({ role: 'student', isActive: true }),
        User_1.default.countDocuments({ role: 'tutor', isActive: true }),
        User_1.default.countDocuments({ role: 'tutor', isVerified: true, isActive: true }),
        User_1.default.countDocuments({
            lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        User_1.default.countDocuments({
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }),
        calculateUserRetentionRate()
    ]);
    return {
        totalStudents,
        totalTutors,
        verifiedTutors,
        activeUsers,
        newUsersThisMonth,
        userRetentionRate
    };
};
exports.getUserAnalytics = getUserAnalytics;
/**
 * Get session analytics
 */
const getSessionAnalytics = async () => {
    const [totalSessions, completedSessions, cancelledSessions, averageSessionDuration, sessionsByStatus, sessionsByMonth, popularTimeSlots] = await Promise.all([
        session_model_1.default.countDocuments(),
        session_model_1.default.countDocuments({ status: 'completed' }),
        session_model_1.default.countDocuments({ status: 'cancelled' }),
        session_model_1.default.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
        ]).then(result => result[0]?.avgDuration || 0),
        getSessionsByStatus(),
        getSessionsByMonth(),
        getPopularTimeSlots()
    ]);
    return {
        totalSessions,
        completedSessions,
        cancelledSessions,
        averageSessionDuration,
        sessionsByStatus,
        sessionsByMonth,
        popularTimeSlots
    };
};
exports.getSessionAnalytics = getSessionAnalytics;
/**
 * Get revenue analytics
 */
const getRevenueAnalytics = async () => {
    const [totalRevenue, monthlyRevenue, averageSessionPrice, revenueByStatus, revenueByMonth, topEarningTutors] = await Promise.all([
        payment_model_1.default.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0),
        payment_model_1.default.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0),
        payment_model_1.default.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, avgPrice: { $avg: '$amount' } } }
        ]).then(result => result[0]?.avgPrice || 0),
        getRevenueByStatus(),
        getRevenueByMonth(),
        getTopEarningTutors()
    ]);
    return {
        totalRevenue,
        monthlyRevenue,
        averageSessionPrice,
        revenueByStatus,
        revenueByMonth,
        topEarningTutors
    };
};
exports.getRevenueAnalytics = getRevenueAnalytics;
// Helper functions
const getUserGrowth = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return await User_1.default.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
            $project: {
                month: {
                    $concat: [
                        { $toString: '$_id.year' },
                        '-',
                        { $toString: '$_id.month' }
                    ]
                },
                count: 1
            }
        }
    ]);
};
const getSessionStats = async () => {
    return await session_model_1.default.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};
const getRevenueStats = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return await payment_model_1.default.aggregate([
        {
            $match: {
                status: 'completed',
                createdAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                amount: { $sum: '$amount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
            $project: {
                month: {
                    $concat: [
                        { $toString: '$_id.year' },
                        '-',
                        { $toString: '$_id.month' }
                    ]
                },
                amount: 1
            }
        }
    ]);
};
const getTopTutors = async () => {
    return await User_1.default.aggregate([
        { $match: { role: 'tutor', isActive: true } },
        { $sort: { rating: -1, totalSessions: -1 } },
        { $limit: 10 },
        {
            $project: {
                name: 1,
                rating: 1,
                sessions: '$totalSessions',
                revenue: 1
            }
        }
    ]);
};
const getPopularSubjects = async () => {
    return await session_model_1.default.aggregate([
        { $group: { _id: '$subject', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
};
const getSessionsByStatus = async () => {
    return await session_model_1.default.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};
const getSessionsByMonth = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return await session_model_1.default.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
            $project: {
                month: {
                    $concat: [
                        { $toString: '$_id.year' },
                        '-',
                        { $toString: '$_id.month' }
                    ]
                },
                count: 1
            }
        }
    ]);
};
const getPopularTimeSlots = async () => {
    return await session_model_1.default.aggregate([
        { $match: { status: 'completed' } },
        {
            $group: {
                _id: { $hour: '$startTime' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } },
        {
            $project: {
                hour: '$_id',
                count: 1
            }
        }
    ]);
};
const getRevenueByStatus = async () => {
    return await payment_model_1.default.aggregate([
        { $group: { _id: '$status', amount: { $sum: '$amount' } } },
        { $sort: { amount: -1 } }
    ]);
};
const getRevenueByMonth = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return await payment_model_1.default.aggregate([
        {
            $match: {
                status: 'completed',
                createdAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                amount: { $sum: '$amount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        {
            $project: {
                month: {
                    $concat: [
                        { $toString: '$_id.year' },
                        '-',
                        { $toString: '$_id.month' }
                    ]
                },
                amount: 1
            }
        }
    ]);
};
const getTopEarningTutors = async () => {
    return await payment_model_1.default.aggregate([
        { $match: { status: 'completed' } },
        {
            $lookup: {
                from: 'users',
                localField: 'tutorId',
                foreignField: '_id',
                as: 'tutor'
            }
        },
        { $unwind: '$tutor' },
        {
            $group: {
                _id: '$tutorId',
                name: { $first: '$tutor.name' },
                revenue: { $sum: '$amount' },
                sessions: { $sum: 1 }
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
    ]);
};
const calculateUserRetentionRate = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const [activeUsers, totalUsers] = await Promise.all([
        User_1.default.countDocuments({
            lastActive: { $gte: thirtyDaysAgo },
            createdAt: { $lte: sixtyDaysAgo }
        }),
        User_1.default.countDocuments({
            createdAt: { $lte: sixtyDaysAgo }
        })
    ]);
    return totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
};
//# sourceMappingURL=analytics.service.js.map