import { ObjectId } from 'mongodb';
import { AuditDetails, PortalAuditDetails, TfmAuditDetails } from '../types/audit-details';

export const generateSystemAuditDetails = (): AuditDetails => ({
  userType: 'system',
});

export const generatePortalAuditDetails = (id: string | ObjectId): PortalAuditDetails => ({
  userType: 'portal',
  id,
});

export const generateTfmAuditDetails = (id: string | ObjectId): TfmAuditDetails => ({
  userType: 'tfm',
  id,
});

export const generateNoUserLoggedInAuditDetails = (): AuditDetails => ({
  userType: 'none',
});
