import { ObjectId } from 'mongodb';
import { UserInformation } from '../../types/userInformation';

type AuditDatabaseRecord = {
  lastUpdatedAt: Date;
  lastUpdatedByPortalUserId: ObjectId | null;
  lastUpdatedByTfmUserId: ObjectId | null;
  lastUpdatedByIsSystem: boolean | null;
  noUserLoggedIn: boolean | null;
};

export const generatePortalUserAuditDatabaseRecord = (userId: string | ObjectId): AuditDatabaseRecord => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByPortalUserId: new ObjectId(userId),
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: null,
});

export const generateTfmUserAuditDatabaseRecord = (userId: string | ObjectId): AuditDatabaseRecord => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: new ObjectId(userId),
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: null,
});

export const generateSystemAuditDatabaseRecord = (): AuditDatabaseRecord => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: true,
  noUserLoggedIn: null,
});

export const generateNoUserLoggedInAuditDatabaseRecord = (): AuditDatabaseRecord => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: true,
});

export const generateAuditDatabaseRecordFromUserInformation = (userInformation: UserInformation) => {
  switch (userInformation.userType) {
    case 'tfm':
      return generateTfmUserAuditDatabaseRecord(userInformation.id);
    case 'portal':
      return generatePortalUserAuditDatabaseRecord(userInformation.id);
    case 'system':
      return generateSystemAuditDatabaseRecord();
    default:
      throw new Error('Invalid userInformation userType');
  }
};
