import { Chat } from '../models/chat.model';
import User from '../models/User';
import Session from '../models/session.model';
import Payment from '../models/payment.model';

export interface DashboardStats {
  totalUsers: number;
  totalSessions: number;
  totalRevenue: number;
  activeChats: number;
  userGrowth: Array<{ month: string; count: number }>;
  sessionStats: Array<{ status: string; count: number }>;
  revenueStats: Array<{ month: string; amount: number }>;
  topTutors: Array<{ name: string; rating: number; sessions: number; revenue: number }>;
  popularSubjects: Array<{ subject: string; count: number }>;
}

export interface UserAnalytics {
  totalStudents: number;
  totalTutors: number;
  verifiedTutors: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userRetentionRate: number;
}

export interface SessionAnalytics {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageSessionDuration: number;
  sessionsByStatus: Array<{ status: string; count: number }>;
  sessionsByMonth: Array<{ month: string; count: number }>;
  popularTimeSlots: Array<{ hour: number; count: number }>;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageSessionPrice: number;
  revenueByStatus: Array<{ status: string; amount: number }>;
  revenueByMonth: Array<{ month: string; amount: number }>;
  topEarningTutors: Array<{ name: string; revenue: number; sessions: number }>;
}

/**
 * Get comprehensive dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [
    totalUsers,
    totalSessions,
    totalRevenue,
    activeChats,
    userGrowth,
    sessionStats,
    revenueStats,
    topTutors,
    popularSubjects
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Session.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).then(result => result[0]?.total || 0),
    Chat.countDocuments({ isActive: true }),
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

/**
 * Get user analytics
 */
export const getUserAnalytics = async (): Promise<UserAnalytics> => {
  const [
    totalStudents,
    totalTutors,
    verifiedTutors,
    activeUsers,
    newUsersThisMonth,
    userRetentionRate
  ] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'tutor', isActive: true }),
    User.countDocuments({ role: 'tutor', isVerified: true, isActive: true }),
    User.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    }),
    User.countDocuments({ 
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

/**
 * Get session analytics
 */
export const getSessionAnalytics = async (): Promise<SessionAnalytics> => {
  const [
    totalSessions,
    completedSessions,
    cancelledSessions,
    averageSessionDuration,
    sessionsByStatus,
    sessionsByMonth,
    popularTimeSlots
  ] = await Promise.all([
    Session.countDocuments(),
    Session.countDocuments({ status: 'completed' }),
    Session.countDocuments({ status: 'cancelled' }),
    Session.aggregate([
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

/**
 * Get revenue analytics
 */
export const getRevenueAnalytics = async (): Promise<RevenueAnalytics> => {
  const [
    totalRevenue,
    monthlyRevenue,
    averageSessionPrice,
    revenueByStatus,
    revenueByMonth,
    topEarningTutors
  ] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).then(result => result[0]?.total || 0),
    Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).then(result => result[0]?.total || 0),
    Payment.aggregate([
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

// Helper functions
const getUserGrowth = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return await User.aggregate([
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
  return await Session.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

const getRevenueStats = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return await Payment.aggregate([
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
  return await User.aggregate([
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
  return await Session.aggregate([
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
};

const getSessionsByStatus = async () => {
  return await Session.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

const getSessionsByMonth = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return await Session.aggregate([
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
  return await Session.aggregate([
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
  return await Payment.aggregate([
    { $group: { _id: '$status', amount: { $sum: '$amount' } } },
    { $sort: { amount: -1 } }
  ]);
};

const getRevenueByMonth = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return await Payment.aggregate([
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
  return await Payment.aggregate([
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

const calculateUserRetentionRate = async (): Promise<number> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [activeUsers, totalUsers] = await Promise.all([
    User.countDocuments({ 
      lastActive: { $gte: thirtyDaysAgo },
      createdAt: { $lte: sixtyDaysAgo }
    }),
    User.countDocuments({ 
      createdAt: { $lte: sixtyDaysAgo }
    })
  ]);

  return totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
};
