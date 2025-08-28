import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
export interface AuthenticatedRequest extends Request {
    user: JwtPayload & {
        id: string;
        role: string;
        email: string;
    };
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const authorizeRole: (role: "student" | "tutor" | "admin") => (req: Request, res: Response, next: NextFunction) => void;
export declare const authorizeRoles: (roles: ("student" | "tutor" | "admin")[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map