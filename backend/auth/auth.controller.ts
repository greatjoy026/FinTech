import { Request, Response, Router } from 'express';
import { AuthService } from './auth.service';

export const authRouter = Router();

authRouter.post('/request-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const result = await AuthService.requestOtp(phoneNumber);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, code, role } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and code are required' });
    }
    const result = await AuthService.verifyOtpAndLogin(phoneNumber, code, role);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    const result = await AuthService.refresh(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

authRouter.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
