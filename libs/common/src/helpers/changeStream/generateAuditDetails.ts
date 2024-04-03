import { ObjectId } from 'mongodb';

type AuditDetails = {
  lastUpdatedAt: Date;
  lastUpdatedByPortalUserId: ObjectId | null;
  lastUpdatedByTfmUserId: ObjectId | null;
  lastUpdatedByIsSystem: boolean | null;
  noUserLoggedIn: boolean | null;
};

export const generatePortalUserAuditDetails = (userId: string | ObjectId): AuditDetails => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByPortalUserId: new ObjectId(userId),
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: null,
});

export const generateTfmUserAuditDetails = (userId: string | ObjectId): AuditDetails => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: new ObjectId(userId),
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: null,
});

export const generateSystemAuditDetails = (): AuditDetails => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: true,
  noUserLoggedIn: null,
});

export const generateNoUserLoggedInAuditDetails = (): AuditDetails => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByPortalUserId: null,
  lastUpdatedByTfmUserId: null,
  lastUpdatedByIsSystem: null,
  noUserLoggedIn: true,
});
