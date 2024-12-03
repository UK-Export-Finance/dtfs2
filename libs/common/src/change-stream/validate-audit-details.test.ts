import { ObjectId } from 'mongodb';
import difference from 'lodash.difference';
import { validateAuditDetails, validateAuditDetailsAndUserType } from './validate-audit-details';
import { AUDIT_USER_TYPES_AS_ARRAY, AUDIT_USER_TYPES_NOT_REQUIRING_ID, AUDIT_USER_TYPES_REQUIRING_ID } from '../constants';
import { InvalidAuditDetailsError } from '../errors';

describe('validateAuditDetails', () => {
  it("throws the 'InvalidAuditDetailsError' when the auditDetails is not an object", () => {
    // Arrange
    const auditDetails = 'audit details';

    // Act / Assert
    expect(() => validateAuditDetails(auditDetails)).toThrow(new InvalidAuditDetailsError('Supplied auditDetails must be an object'));
  });

  it("throws the 'InvalidAuditDetailsError' when the auditDetails does not contain the 'userType' field", () => {
    // Arrange
    const auditDetails = { id: 'abc123' };

    // Act / Assert
    expect(() => validateAuditDetails(auditDetails)).toThrow(new InvalidAuditDetailsError("Supplied auditDetails must contain a 'userType' property"));
  });

  describe.each(Object.values(AUDIT_USER_TYPES_REQUIRING_ID))('when userType is %s', (userType) => {
    it('does not throw if id is a valid 24 digit hex string', () => {
      expect(() => validateAuditDetails({ userType, id: '1234567890abcdef12345678' })).not.toThrow();
    });

    it('does not throw if id is a valid ObjectId', () => {
      expect(() => validateAuditDetails({ userType, id: new ObjectId('1234567890abcdef12345678') })).not.toThrow();
    });

    it.each([
      {
        condition: 'no id is provided',
        errorMessage: `Supplied auditDetails must contain the 'id' field for 'userType' '${userType}'`,
        auditDetails: { userType },
      },
      {
        condition: 'the supplied id is not a valid ObjectId',
        errorMessage: "Supplied auditDetails 'id' field must be a valid ObjectId",
        auditDetails: { userType, id: 'invalid-id' },
      },
    ] as const)("throws the 'InvalidAuditDetailsError' when $condition", ({ errorMessage, auditDetails }) => {
      // Act / Assert
      expect(() => validateAuditDetails(auditDetails)).toThrow(new InvalidAuditDetailsError(errorMessage));
    });
  });

  describe.each(Object.values(AUDIT_USER_TYPES_NOT_REQUIRING_ID))('when userType is %s', () => {
    it('does not throw when no id is provided', () => {
      expect(() => validateAuditDetails({ userType: 'system' })).not.toThrow();
    });
  });

  it("throws the 'InvalidAuditDetailsError' when the userType is invalid", () => {
    // Arrange
    const auditDetails = { userType: 'invalid-type' };

    // Act / Assert
    expect(() => validateAuditDetails(auditDetails)).toThrow(
      new InvalidAuditDetailsError("Supplied auditDetails 'userType' must be one of: 'tfm', 'portal', 'system', 'none'"),
    );
  });
});

describe('validateAuditDetailsAndUserType', () => {
  describe.each(Object.values(AUDIT_USER_TYPES_NOT_REQUIRING_ID))('when the userType is %s', (userType) => {
    // Arrange
    const auditDetails = { userType };

    const otherUserTypes = difference(AUDIT_USER_TYPES_AS_ARRAY, [userType]);
    it.each(otherUserTypes)('throws an error when the required userType is %s', (requiredUserType) => {
      // Act / Assert
      expect(() => validateAuditDetailsAndUserType(auditDetails, requiredUserType)).toThrow(
        new InvalidAuditDetailsError(`Supplied auditDetails 'userType' must be '${requiredUserType}' (was '${userType}')`),
      );
    });
  });
});
