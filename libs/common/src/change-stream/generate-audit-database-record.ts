import { ObjectId } from 'mongodb';
import { AuditDetails } from '../types/audit-details';
import { AuditDatabaseRecord } from '../types/audit-database-record';
import { getNowAsUtcISOString } from '../helpers/date';

export const generatePortalUserAuditDatabaseRecord = (userId: string | ObjectId): AuditDatabaseRecord => ({
  lastUpdatedAt: getNowAsUtcISOString(),
  lastUpdatedByPortalUserId: new ObjectId(userId),
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: null,
});

export const generateTfmUserAuditDatabaseRecord = (userId: string | ObjectId): AuditDatabaseRecord => ({
  lastUpdatedAt: getNowAsUtcISOString(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: new ObjectId(userId),
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: null,
});

export const generateSystemAuditDatabaseRecord = (): AuditDatabaseRecord => ({
  lastUpdatedAt: getNowAsUtcISOString(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: true,
  noUserLoggedIn: null,
});

export const generateNoUserLoggedInAuditDatabaseRecord = (): AuditDatabaseRecord => ({
  lastUpdatedAt: getNowAsUtcISOString(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: true,
});

export const generateAuditDatabaseRecordFromAuditDetails = (auditDetails: AuditDetails) => {
  switch (auditDetails.userType) {
    case 'tfm':
      return generateTfmUserAuditDatabaseRecord(auditDetails.id);
    case 'portal':
      return generatePortalUserAuditDatabaseRecord(auditDetails.id);
    case 'system':
      return generateSystemAuditDatabaseRecord();
    case 'none':
      return generateNoUserLoggedInAuditDatabaseRecord();
    default:
      throw new Error('Invalid auditDetails userType');
  }
};
