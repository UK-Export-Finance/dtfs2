import { ObjectId } from 'mongodb';
import { AuditDetails } from '../../types/audit-details';
import { AuditDatabaseRecord } from '../../types/audit-database-record';
import { getNowAsISOString } from '../date';

export const generatePortalUserAuditDatabaseRecord = (userId: string | ObjectId): AuditDatabaseRecord => ({
  lastUpdatedAt: getNowAsISOString(),
  lastUpdatedByPortalUserId: new ObjectId(userId),
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: null,
});

export const generateTfmUserAuditDatabaseRecord = (userId: string | ObjectId): AuditDatabaseRecord => ({
  lastUpdatedAt: getNowAsISOString(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: new ObjectId(userId),
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: null,
});

export const generateSystemAuditDatabaseRecord = (): AuditDatabaseRecord => ({
  lastUpdatedAt: getNowAsISOString(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: true,
  noUserLoggedIn: null,
});

export const generateNoUserLoggedInAuditDatabaseRecord = (): AuditDatabaseRecord => ({
  lastUpdatedAt: getNowAsISOString(),
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
    default:
      throw new Error('Invalid auditDetails userType');
  }
};
