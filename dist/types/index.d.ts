export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'tutor' | 'admin';
    profilePicture?: string;
    bio?: string;
    phone?: string;
    dateOfBirth?: Date;
    location?: string;
    timezone?: string;
    skills?: string[];
    certifications?: Array<{
        name: string;
        issuer: string;
        issueDate: Date;
        expiryDate?: Date;
        credentialId?: string;
        credentialUrl?: string;
    }>;
    education?: Array<{
        degree: string;
        institution: string;
        graduationYear: number;
        fieldOfStudy: string;
        gpa?: number;
    }>;
    rating?: number;
    totalRatings: number;
    totalSessions: number;
    isVerified: boolean;
    isActive: boolean;
    lastActive: Date;
    preferences?: {
        subjects?: string[];
        availability?: string[];
        maxPrice?: number;
        currency?: string;
        language?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface Session {
    _id: string;
    studentId: string;
    tutorId: string;
    subject: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
    sessionType: 'one-on-one' | 'group' | 'exam-prep' | 'homework-help';
    price: number;
    currency: string;
    notes?: string;
    meetingLink?: string;
    recordingUrl?: string;
    rating?: number;
    review?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Payment {
    _id: string;
    sessionId: string;
    studentId: string;
    tutorId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
    paymentMethod: 'stripe' | 'paypal' | 'bank_transfer';
    stripePaymentIntentId?: string;
    stripeChargeId?: string;
    paypalOrderId?: string;
    paypalCaptureId?: string;
    description: string;
    metadata?: Record<string, any>;
    refundReason?: string;
    refundAmount?: number;
    refundedAt?: Date;
    failureReason?: string;
    failureCode?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    messageType: 'text' | 'file' | 'image' | 'system';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface Chat {
    _id: string;
    participants: string[];
    sessionId?: string;
    lastMessage?: string;
    lastMessageAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'tutor';
}
export interface AuthResponse {
    token: string;
    user: User;
}
export interface ApiResponse<T> {
    message: string;
    data?: T;
    errors?: string[];
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=index.d.ts.map