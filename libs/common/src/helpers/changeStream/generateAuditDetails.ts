import { ObjectId } from 'mongodb';
import { UserInformation } from '../../types/auditDetails';

export const generateSystemAuditDetails = (): UserInformation => ({
  userType: 'system',
});

export const generatePortalAuditDetails = (id: string | ObjectId): UserInformation => ({
  userType: 'portal',
  id,
});

export const generateTfmAuditDetails = (id: string | ObjectId): UserInformation => ({
  userType: 'tfm',
  id,
});
