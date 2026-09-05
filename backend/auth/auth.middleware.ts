import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { FirestoreServer } from '../firestore';
import { hasPermission, isRole, type Permission, type Role } from './authorization';

const UNAUTHORIZED = { error: 'Unauthorized' } as const;
const FORBIDDEN = { error: 'Forbidden' } as const;

export interface AuthRequest extends Request {
  user?: { userId: string; role: Role };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json(UNAUTHORIZED);

  try {
    const payload = jwt.verify(authHeader.slice(7), env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'fintech-auth',
      audience: 'fintech-api',
    }) as { userId?: string };

    if (!payload.userId) return res.status(401).json(UNAUTHORIZED);

    // JWT identifies the principal; Firestore is the authoritative source for current role.
    const user = await FirestoreServer.get('users', payload.userId);
    const role = user?.data?.role;
    if (!isRole(role)) return res.status(401).json(UNAUTHORIZED);

    req.user = { userId: payload.userId, role };
    return next();
  } catch {
    return res.status(401).json(UNAUTHORIZED);
  }
};

export const requireRole = (roles: readonly Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json(FORBIDDEN);
  return next();
};

export const requirePermission = (permission: Permission) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !hasPermission(req.user.role, permission)) return res.status(403).json(FORBIDDEN);
  return next();
};

export const requireAdmin = requirePermission('admin:operations');
