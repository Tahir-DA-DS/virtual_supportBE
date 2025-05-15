import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        // other user properties can be here 
      } | JwtPayload;
    }
  }
}