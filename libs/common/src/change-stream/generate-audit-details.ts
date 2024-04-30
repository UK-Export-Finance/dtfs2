import { ObjectId } from 'mongodb';
import { AuditDetails } from '../types/audit-details';

export const generateSystemAuditDetails = (): AuditDetails => ({
  userType: 'system',
});

export const generatePortalAuditDetails = (id: string | ObjectId): AuditDetails => ({
  userType: 'portal',
  id,
});

export const generateTfmAuditDetails = (id: string | ObjectId): AuditDetails => ({
  userType: 'tfm',
  id,
});

export const generateNoUserLoggedInAuditDetails = (): AuditDetails => ({
  userType: 'none',
});
