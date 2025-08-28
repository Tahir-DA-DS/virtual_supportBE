export interface DashboardStats {
    totalUsers: number;
    totalSessions: number;
    totalRevenue: number;
    activeChats: number;
    userGrowth: Array<{
        month: string;
        count: number;
    }>;
    sessionStats: Array<{
        status: string;
        count: number;
    }>;
    revenueStats: Array<{
        month: string;
        amount: number;
    }>;
    topTutors: Array<{
        name: string;
        rating: number;
        sessions: number;
        revenue: number;
    }>;
    popularSubjects: Array<{
        subject: string;
        count: number;
    }>;
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
    sessionsByStatus: Array<{
        status: string;
        count: number;
    }>;
    sessionsByMonth: Array<{
        month: string;
        count: number;
    }>;
    popularTimeSlots: Array<{
        hour: number;
        count: number;
    }>;
}
export interface RevenueAnalytics {
    totalRevenue: number;
    monthlyRevenue: number;
    averageSessionPrice: number;
    revenueByStatus: Array<{
        status: string;
        amount: number;
    }>;
    revenueByMonth: Array<{
        month: string;
        amount: number;
    }>;
    topEarningTutors: Array<{
        name: string;
        revenue: number;
        sessions: number;
    }>;
}
/**
 * Get comprehensive dashboard statistics
 */
export declare const getDashboardStats: () => Promise<DashboardStats>;
/**
 * Get user analytics
 */
export declare const getUserAnalytics: () => Promise<UserAnalytics>;
/**
 * Get session analytics
 */
export declare const getSessionAnalytics: () => Promise<SessionAnalytics>;
/**
 * Get revenue analytics
 */
export declare const getRevenueAnalytics: () => Promise<RevenueAnalytics>;
//# sourceMappingURL=analytics.service.d.ts.map