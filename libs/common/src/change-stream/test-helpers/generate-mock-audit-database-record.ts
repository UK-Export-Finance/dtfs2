import { ObjectId } from 'mongodb';
import {
  generateTfmUserAuditDatabaseRecord,
  generatePortalUserAuditDatabaseRecord,
  generateSystemAuditDatabaseRecord,
  generateNoUserLoggedInAuditDatabaseRecord,
} from '../generate-audit-database-record';
import { AuditDetails } from '../../types';

export const generateMockTfmUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...generateTfmUserAuditDatabaseRecord(mockUserId),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  lastUpdatedAt: expect.any(String),
});

export const generateMockPortalUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...generatePortalUserAuditDatabaseRecord(mockUserId),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  lastUpdatedAt: expect.any(String),
});

export const generateMockSystemAuditDatabaseRecord = () => ({
  ...generateSystemAuditDatabaseRecord(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  lastUpdatedAt: expect.any(String),
});

export const generateMockNoUserLoggedInAuditDatabaseRecord = () => ({
  ...generateNoUserLoggedInAuditDatabaseRecord(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  lastUpdatedAt: expect.any(String),
});

/**
 * @param mockUserId - mock user id
 * @returns mock data that an api GET request would return.
 * In particular, the ObjectId is converted to strings
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const generateParsedMockTfmUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...JSON.parse(JSON.stringify(generateTfmUserAuditDatabaseRecord(mockUserId))),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  lastUpdatedAt: expect.any(String),
});

/**
 * @param mockUserId - mock user id
 * @returns mock data that an api GET request would return.
 * In particular, the ObjectId is converted to strings
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const generateParsedMockPortalUserAuditDatabaseRecord = (mockUserId: string | ObjectId) => ({
  ...JSON.parse(JSON.stringify(generatePortalUserAuditDatabaseRecord(mockUserId))),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  lastUpdatedAt: expect.any(String),
});

export const generateParsedMockAuditDatabaseRecord = (auditDetails: AuditDetails) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  switch (auditDetails.userType) {
    case 'tfm':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return generateParsedMockTfmUserAuditDatabaseRecord(auditDetails.id);
    case 'portal':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return generateParsedMockPortalUserAuditDatabaseRecord(auditDetails.id);
    default:
      throw new Error('Invalid auditDetails userType');
  }
};
