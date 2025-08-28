import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const logout: (_req: Request, res: Response) => Promise<void>;
export declare const getCurrentUser: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map