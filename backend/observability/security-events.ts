export const SECURITY_EVENTS = {
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_THROTTLED: 'AUTH_THROTTLED',
  AUTH_REFRESH_REPLAY: 'AUTH_REFRESH_REPLAY',
  AUTH_SESSION_REVOKED: 'AUTH_SESSION_REVOKED',
  AUTHORIZATION_DENIED: 'AUTHORIZATION_DENIED',
  RATE_LIMITED: 'RATE_LIMITED',
  AUDIT_FAILURE: 'AUDIT_FAILURE',
  WEBHOOK_REJECTED: 'WEBHOOK_REJECTED',
  CONFIGURATION_FAILURE: 'CONFIGURATION_FAILURE',
  ADMIN_OPERATION: 'ADMIN_OPERATION',
} as const;

export type SecurityEvent = typeof SECURITY_EVENTS[keyof typeof SECURITY_EVENTS];

export const ALERT_THRESHOLDS = {
  authFailureRatePerMinute: 20,
  authorizationDenialsPerMinute: 20,
  rateLimitResponsesPerMinute: 30,
  auditFailuresPerMinute: 1,
  webhookRejectionsPerMinute: 10,
  readinessFailuresPerMinute: 3,
} as const;
