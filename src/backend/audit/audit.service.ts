import { prisma } from '../db/prisma';

export class AuditService {
  /**
   * Logs an action comprehensively for compliance
   */
  static async logAction({
    actor,
    action,
    resource,
    resourceId,
    beforeState,
    afterState,
    ipAddress,
    device
  }: {
    actor: string;
    action: string;
    resource: string;
    resourceId: string;
    beforeState?: any;
    afterState?: any;
    ipAddress?: string;
    device?: string;
  }) {
    return await prisma.auditLog.create({
      data: {
        actor,
        action,
        resource,
        resourceId,
        beforeState: beforeState || null,
        afterState: afterState || null,
        ipAddress,
        device
      }
    });
  }
}
