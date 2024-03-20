import { ObjectId } from 'mongodb';

type AuditDetails = {
  lastUpdatedAt: Date;
  lastUpdatedByPortalUserId?: ObjectId;
  lastUpdatedByTfmUserId?: ObjectId;
  lastUpdatedByIsSystem?: boolean;
};

export const generatePortalUserAuditDetails = (userId: string | ObjectId): AuditDetails => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByPortalUserId: new ObjectId(userId),
});

export const generateTfmUserAuditDetails = (userId: string | ObjectId): AuditDetails => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByTfmUserId: new ObjectId(userId),
});

export const generateSystemAuditDetails = (): AuditDetails => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByIsSystem: true,
});
