import { Request, Response, Router } from 'express';
import { AuthService } from './auth.service';

export const authRouter = Router();

const authFailure = { error: 'Authentication failed' };

function clientIp(req: Request): string {
  return req.ip || 'unknown';
}

authRouter.post('/request-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    if (typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    await AuthService.requestOtp(phoneNumber.trim(), clientIp(req));
    // Never return the OTP, whether it is generated or delivered by a provider.
    return res.json({ message: 'OTP sent successfully' });
  } catch {
    // Do not disclose whether a phone number exists or whether a rate limit was hit.
    return res.status(200).json({ message: 'OTP sent successfully' });
  }
});

authRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, code } = req.body;
    if (typeof phoneNumber !== 'string' || typeof code !== 'string' || !phoneNumber.trim() || !code.trim()) {
      return res.status(401).json(authFailure);
    }
    const result = await AuthService.verifyOtpAndLogin(phoneNumber.trim(), code.trim(), clientIp(req));
    return res.json(result);
  } catch {
    return res.status(401).json(authFailure);
  }
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
      return res.status(401).json(authFailure);
    }
    const result = await AuthService.refresh(refreshToken.trim());
    return res.json(result);
  } catch {
    return res.status(401).json(authFailure);
  }
});

authRouter.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (typeof refreshToken === 'string' && refreshToken.trim()) {
      await AuthService.logout(refreshToken.trim());
    }
    // Logout is intentionally idempotent and does not reveal token validity.
    return res.json({ message: 'Logged out successfully' });
  } catch {
    return res.json({ message: 'Logged out successfully' });
  }
});
