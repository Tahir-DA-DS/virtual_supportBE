export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare const handleError: (error: any) => {
    statusCode: number;
    message: string;
    isOperational: boolean;
    errors?: undefined;
} | {
    statusCode: number;
    message: string;
    errors: any[];
    isOperational: boolean;
};
export declare const asyncHandler: (fn: Function) => (req: any, res: any, next: any) => void;
//# sourceMappingURL=errorHandler.d.ts.map