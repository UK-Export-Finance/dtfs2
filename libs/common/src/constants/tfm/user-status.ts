/**
 * This module defines constants for user statuses.
 *
 * @constant {object} USER_STATUS - An object containing user status constants.
 * @property {string} USER_STATUS.ACTIVE - Represents an active user status.
 * @property {string} USER_STATUS.BLOCKED - Represents a blocked user status.
 */

export const USER_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
} as const;
