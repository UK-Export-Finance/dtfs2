/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ObjectId } from 'mongodb';
import {
  generateTfmUserAuditDatabaseRecord,
  generatePortalUserAuditDatabaseRecord,
  generateSystemAuditDatabaseRecord,
  generateNoUserLoggedInAuditDatabaseRecord,
} from '../generate-audit-database-record';
import { AuditDetails } from '../../types';
import '../../test-helpers/expect-to-be-object-id';

export const generateMockTfmUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...generateTfmUserAuditDatabaseRecord(mockUserId),
  lastUpdatedAt: expect.any(String),
});

export const generateMockPortalUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...generatePortalUserAuditDatabaseRecord(mockUserId),
  lastUpdatedAt: expect.any(String),
});

export const generateMockSystemAuditDatabaseRecord = () => ({
  ...generateSystemAuditDatabaseRecord(),
  lastUpdatedAt: expect.any(String),
});

export const generateMockNoUserLoggedInAuditDatabaseRecord = () => ({
  ...generateNoUserLoggedInAuditDatabaseRecord(),
  lastUpdatedAt: expect.any(String),
});

/**
 * @param mockUserId - mock user id
 * @returns mock data that an api GET request would return.
 * In particular, the ObjectId is converted to strings
 */
export const generateParsedMockTfmUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...JSON.parse(JSON.stringify(generateTfmUserAuditDatabaseRecord(mockUserId))),
  lastUpdatedAt: expect.any(String),
});

/**
 * @param mockUserId - mock user id
 * @returns mock data that an api GET request would return.
 * In particular, the ObjectId is converted to strings
 */
export const generateParsedMockPortalUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...JSON.parse(JSON.stringify(generatePortalUserAuditDatabaseRecord(mockUserId))),
  lastUpdatedAt: expect.any(String),
});

export const expectAnyPortalUserAuditDatabaseRecord = () => ({
  lastUpdatedAt: expect.any(String),
  lastUpdatedByPortalUserId: expect.toBeObjectId(),
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: null,
});

export const generateParsedMockAuditDatabaseRecord = (auditDetails: AuditDetails) => {
  switch (auditDetails.userType) {
    case 'tfm':
      return generateParsedMockTfmUserAuditDatabaseRecord(auditDetails.id);
    case 'portal':
      return generateParsedMockPortalUserAuditDatabaseRecord(auditDetails.id);
    default:
      throw new Error('Invalid auditDetails userType');
  }
};
