import type { NextFunction, Response } from 'express';
import { AuditService } from '../audit/audit.service';
import { hasPermission, type Role } from './authorization';
import type { AuthRequest } from './auth.middleware';

const FORBIDDEN = { error: 'Forbidden' } as const;

export const PRIVILEGED_OPERATION_NAMES = [
  'PRODUCTION_ACCESS',
  'SECURITY_CONFIGURATION',
  'BACKUP_RECOVERY_ADMINISTRATION',
  'IDENTITY_ADMINISTRATION',
] as const;

export type PrivilegedOperation = (typeof PRIVILEGED_OPERATION_NAMES)[number];

export function isPrivilegedOperation(value: unknown): value is PrivilegedOperation {
  return typeof value === 'string' && (PRIVILEGED_OPERATION_NAMES as readonly string[]).includes(value);
}

/** Privileged operations fail closed and use only the trusted authenticated principal. */
export const requirePrivilegedOperation = (operation: PrivilegedOperation) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !hasPermission(req.user.role, 'admin:privileged')) {
      if (req.user) {
        try {
          await AuditService.record({
            actorId: req.user.userId,
            role: req.user.role,
            action: 'PRIVILEGED_OPERATION_DENIED',
            resource: operation,
            outcome: 'DENIED',
            requestId: String(req.headers['x-request-id'] ?? ''),
            ipAddress: req.ip,
            device: String(req.headers['user-agent'] ?? '').slice(0, 512) || undefined,
          });
        } catch (error) {
          return next(error);
        }
      }
      return res.status(403).json(FORBIDDEN);
    }

    try {
      await AuditService.record({
        actorId: req.user.userId,
        role: req.user.role,
        action: 'PRIVILEGED_OPERATION_AUTHORIZED',
        resource: operation,
        outcome: 'SUCCESS',
        requestId: String(req.headers['x-request-id'] ?? ''),
        ipAddress: req.ip,
        device: String(req.headers['user-agent'] ?? '').slice(0, 512) || undefined,
      });
      return next();
    } catch (error) {
      return next(error);
    }
  };

export function roleCanPerformPrivilegedOperation(role: unknown): role is Role {
  return hasPermission(role, 'admin:privileged');
}
