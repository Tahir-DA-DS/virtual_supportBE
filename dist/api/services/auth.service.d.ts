import { IUser } from '../models/User';
/**
 * Register a new user
 * @param name user's name
 * @param email user's email
 * @param password plain text password
 * @param role 'student' | 'tutor'
 */
export declare const registerUser: (name: string, email: string, password: string, role: "student" | "tutor") => Promise<IUser>;
export declare const loginUser: (email: string, password: string) => Promise<{
    token: string;
    user: IUser;
}>;
//# sourceMappingURL=auth.service.d.ts.map