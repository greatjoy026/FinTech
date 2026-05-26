import { Request, Response, NextFunction } from 'express';

export type Role = 
  | 'super_admin' 
  | 'finance_officer' 
  | 'fraud_analyst' 
  | 'compliance_officer' 
  | 'support_agent'
  | 'merchant_admin'
  | 'school_admin'
  | 'ngo_manager'
  | 'event_organizer';

export const requireRoles = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Assuming `authenticate` middleware has already run and attached `req.user`
    const user = (req as any).user;

    if (!user || !user.role) {
      return res.status(401).json({ error: 'Unauthorized: No role specified' });
    }

    if (user.role === 'super_admin' || allowedRoles.includes(user.role as Role)) {
      next();
    } else {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
  };
};
