import { Request, Response } from 'express';
import {registerUser, loginUser} from '../services/auth.service'

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
    const newUser = await registerUser(req.body);
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
    const user = await loginUser(req.body.email, req.body.password);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};