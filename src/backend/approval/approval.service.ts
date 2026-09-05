import { prisma } from '../db/prisma';
import { AuditService } from '../../../backend/audit/audit.service';
import { RealtimeGateway } from '../realtime/socket.gateway';

export class ApprovalWorkflowEngine {
  /**
   * Maker pattern to request an action (e.g. payout, config change)
   */
  static async requestAction(type: string, payload: any, makerId: string) {
    const request = await prisma.approvalRequest.create({
      data: {
        type,
        status: 'PENDING',
        payload: payload,
        makerId
      }
    });

    RealtimeGateway.broadcastAdminEvent('approval:new', {
      requestId: request.id,
      type
    });

    return request;
  }

  /**
   * Checker/Approver evaluates the requested action.
   */
  static async approveAction(requestId: string, approverId: string) {
    const request = await prisma.approvalRequest.findUniqueOrThrow({
      where: { id: requestId }
    });

    if (request.status !== 'PENDING') {
      throw new Error('Request is not pending approval');
    }

    if (request.makerId === approverId) {
      throw new Error('Maker and Approver cannot be the same person');
    }

    // Process logic based on type (e.g. execute payout)
    // Execution engine integration goes here.

    const updated = await prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approverId
      }
    });

    await AuditService.logAction({
      actor: approverId,
      action: 'APPROVE_WORKFLOW',
      resource: 'APPROVAL_REQUEST',
      resourceId: requestId,
      beforeState: { status: 'PENDING' },
      afterState: { status: 'APPROVED' }
    });

    return updated;
  }

  static async rejectAction(requestId: string, approverId: string, reason: string) {
    const request = await prisma.approvalRequest.findUniqueOrThrow({
      where: { id: requestId }
    });

    const updated = await prisma.approvalRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        approverId,
        rejectionRsn: reason
      }
    });

    return updated;
  }
}
