type AuditDetails = {
  lastUpdatedAt: Date;
  lastUpdatedByPortalUserId?: string;
  lastUpdatedByTfmUserId?: string;
  lastUpdatedByIsSystem?: boolean;
};

export const generatePortalUserAuditDetails = (userId: string): AuditDetails => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByPortalUserId: userId,
});

export const generateTfmUserAuditDetails = (userId: string): AuditDetails => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByTfmUserId: userId,
});

export const generateSystemAuditDetails = (): AuditDetails => ({
  lastUpdatedAt: new Date(),
  lastUpdatedByIsSystem: true,
});
