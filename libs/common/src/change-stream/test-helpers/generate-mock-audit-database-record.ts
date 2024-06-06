import { ObjectId } from 'mongodb';
import {
  generateTfmUserAuditDatabaseRecord,
  generatePortalUserAuditDatabaseRecord,
  generateSystemAuditDatabaseRecord,
  generateNoUserLoggedInAuditDatabaseRecord,
} from '../generate-audit-database-record';
import { AuditDatabaseRecord, AuditDetails } from '../../types';

export const generateMockTfmUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...generateTfmUserAuditDatabaseRecord(mockUserId),
  lastUpdatedAt: expect.any(String) as string,
});

export const generateMockPortalUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...generatePortalUserAuditDatabaseRecord(mockUserId),
  lastUpdatedAt: expect.any(String) as string,
});

export const generateMockSystemAuditDatabaseRecord = () => ({
  ...generateSystemAuditDatabaseRecord(),
  lastUpdatedAt: expect.any(String) as string,
});

export const generateMockNoUserLoggedInAuditDatabaseRecord = () => ({
  ...generateNoUserLoggedInAuditDatabaseRecord(),
  lastUpdatedAt: expect.any(String) as string,
});

/**
 * @param mockUserId - mock user id
 * @returns mock data that an api GET request would return.
 * In particular, the ObjectId is converted to strings
 */
export const generateParsedMockTfmUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...(JSON.parse(JSON.stringify(generateTfmUserAuditDatabaseRecord(mockUserId))) as object),
  lastUpdatedAt: expect.any(String) as string,
});

/**
 * @param mockUserId - mock user id
 * @returns mock data that an api GET request would return.
 * In particular, the ObjectId is converted to strings
 */
export const generateParsedMockPortalUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...(JSON.parse(JSON.stringify(generatePortalUserAuditDatabaseRecord(mockUserId))) as object),
  lastUpdatedAt: expect.any(String) as string,
});

export const expectAnyPortalUserAuditDatabaseRecord = (): AuditDatabaseRecord => ({
  lastUpdatedAt: expect.any(String) as string,
  lastUpdatedByPortalUserId: expect.anything() as ObjectId,
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
