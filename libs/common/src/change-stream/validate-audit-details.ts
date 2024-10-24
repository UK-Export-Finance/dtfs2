import { ObjectId } from 'mongodb';
import { AuditDetails } from '../types/audit-details';
import { InvalidAuditDetailsError } from '../errors';
import { AuditUserTypes, AuditUserTypesRequiringId } from '../types';
import { AUDIT_USER_TYPES_AS_ARRAY } from '../constants';

const AUDIT_DETAILS_VALIDATION_ERRORS = {
  MUST_BE_OBJECT: 'Supplied auditDetails must be an object',
  MUST_CONTAIN_USER_TYPE: "Supplied auditDetails must contain a 'userType' property",
  ID_MUST_BE_OBJECT_ID: "Supplied auditDetails 'id' field must be a valid ObjectId",
  FOR_USER_TYPE: (type: AuditUserTypesRequiringId) =>
    ({
      MUST_CONTAIN_ID: `Supplied auditDetails must contain the 'id' field for 'userType' '${type}'`,
    }) as const,
  INVALID_USER_TYPE: `Supplied auditDetails 'userType' must be one of: '${AUDIT_USER_TYPES_AS_ARRAY.join("', '")}'`,
  USER_TYPE_DOES_NOT_MATCH: (requiredType: AuditUserTypes, foundType: AuditUserTypes) =>
    `Supplied auditDetails 'userType' must be '${requiredType}' (was '${foundType}')`,
} as const;

const getAuditDetailsValidationError = (auditDetails: unknown): string | undefined => {
  if (auditDetails === null || typeof auditDetails !== 'object') {
    return AUDIT_DETAILS_VALIDATION_ERRORS.MUST_BE_OBJECT;
  }

  if (!('userType' in auditDetails)) {
    return AUDIT_DETAILS_VALIDATION_ERRORS.MUST_CONTAIN_USER_TYPE;
  }

  switch (auditDetails.userType) {
    case 'tfm':
    case 'portal':
      if (!('id' in auditDetails)) {
        return AUDIT_DETAILS_VALIDATION_ERRORS.FOR_USER_TYPE(auditDetails.userType).MUST_CONTAIN_ID;
      }

      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      if (auditDetails.id && ObjectId.isValid(auditDetails.id.toString())) {
        return undefined;
      }
      return AUDIT_DETAILS_VALIDATION_ERRORS.ID_MUST_BE_OBJECT_ID;
    case 'system':
    case 'none':
      return undefined;
    default:
      return AUDIT_DETAILS_VALIDATION_ERRORS.INVALID_USER_TYPE;
  }
};

export function validateAuditDetails(auditDetails: unknown): asserts auditDetails is AuditDetails {
  const validationError = getAuditDetailsValidationError(auditDetails);
  if (validationError) {
    throw new InvalidAuditDetailsError(validationError);
  }
}

export function validateAuditDetailsAndUserType<T extends AuditUserTypes>(auditDetails: unknown, requiredUserType: T): asserts auditDetails is AuditDetails<T> {
  validateAuditDetails(auditDetails);

  if (auditDetails.userType !== requiredUserType) {
    throw new InvalidAuditDetailsError(AUDIT_DETAILS_VALIDATION_ERRORS.USER_TYPE_DOES_NOT_MATCH(requiredUserType, auditDetails.userType));
  }
}
