import { ObjectId } from 'mongodb';
import { UserInformation } from '../../types/auditDetails';

export function validateAuditDetails(auditDetails: unknown): asserts auditDetails is UserInformation {
  if (!(auditDetails instanceof Object && 'userType' in auditDetails)) {
    throw new Error('Missing property `userType`');
  }
  switch (auditDetails?.userType) {
    case 'tfm':
      if (!('id' in auditDetails)) {
        throw new Error('Missing property id for tfm user');
      }
      if (auditDetails.id instanceof ObjectId || (typeof auditDetails.id === 'string' && ObjectId.isValid(auditDetails.id))) {
        return;
      }
      throw new Error(`Invalid tfm user id ${auditDetails.id?.toString()}`);
    case 'portal':
      if (!('id' in auditDetails)) {
        throw new Error('Missing property id for portal user');
      }

      if (auditDetails.id instanceof ObjectId || (typeof auditDetails.id === 'string' && ObjectId.isValid(auditDetails.id))) {
        return;
      }
      throw new Error(`Invalid portal user id ${auditDetails.id?.toString()}`);
    case 'system':
      return;
    default:
      throw new Error(`Invalid userType ${auditDetails.userType?.toString()}`);
  }
}
