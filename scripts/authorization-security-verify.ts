import assert from 'node:assert/strict';
import {
  PERMISSIONS,
  canAccessAdminOperations,
  canAccessUserResource,
  hasPermission,
  isRole,
} from '../backend/auth/authorization';

assert.equal(isRole('ADMIN'), true);
assert.equal(isRole('CUSTOMER'), true);
assert.equal(isRole('client-admin'), false);
assert.equal(isRole(undefined), false);

assert.equal(hasPermission('ADMIN', PERMISSIONS.ADMIN_OPERATIONS), true);
assert.equal(hasPermission('CUSTOMER', PERMISSIONS.ADMIN_OPERATIONS), false);
assert.equal(hasPermission('UNKNOWN', PERMISSIONS.READ_REPORTS), false);
assert.equal(canAccessAdminOperations('ADMIN'), true);
assert.equal(canAccessAdminOperations('CUSTOMER'), false);

assert.equal(canAccessUserResource('user-1', 'user-1'), true);
assert.equal(canAccessUserResource('user-1', 'user-2'), false);
assert.equal(canAccessUserResource('', 'user-2'), false);

console.log('Authorization security verification passed.');
