import { ObjectId } from 'mongodb';
import { AuditDetails } from '../types/audit-details';
import { InvalidAuditDetailsError } from '../errors';

export function validateAuditDetails(auditDetails: unknown): asserts auditDetails is AuditDetails {
  if (!(auditDetails instanceof Object && 'userType' in auditDetails)) {
    throw new InvalidAuditDetailsError('Missing property `userType`');
  }
  switch (auditDetails?.userType) {
    case 'tfm':
      if (!('id' in auditDetails)) {
        throw new InvalidAuditDetailsError('Missing property id for tfm user');
      }
      if (auditDetails.id instanceof ObjectId || (typeof auditDetails.id === 'string' && ObjectId.isValid(auditDetails.id))) {
        return;
      }
      throw new InvalidAuditDetailsError(`Invalid tfm user id ${auditDetails.id?.toString()}`);
    case 'portal':
      if (!('id' in auditDetails)) {
        throw new InvalidAuditDetailsError('Missing property id for portal user');
      }

      if (auditDetails.id instanceof ObjectId || (typeof auditDetails.id === 'string' && ObjectId.isValid(auditDetails.id))) {
        return;
      }
      throw new InvalidAuditDetailsError(`Invalid portal user id ${auditDetails.id?.toString()}`);
    case 'system':
      return;
    case 'none':
      return;
    default:
      throw new InvalidAuditDetailsError(`Invalid userType ${auditDetails.userType?.toString()}`);
  }
}

export function validateAuditDetailsAndUserType(auditDetails: unknown, userType: 'system' | 'tfm' | 'portal'): asserts auditDetails is AuditDetails {
  validateAuditDetails(auditDetails);

  if (auditDetails.userType !== userType) {
    throw new InvalidAuditDetailsError(`userType must be '${userType}'`);
  }
}
