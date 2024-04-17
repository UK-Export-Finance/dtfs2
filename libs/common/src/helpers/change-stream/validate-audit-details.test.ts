import { ObjectId } from 'mongodb';
import { validateAuditDetails, validateAuditDetailsAndUserType } from './validate-audit-details';

describe('validateAuditDetails', () => {
  withValidateAuditDetailsTests(validateAuditDetails);

  describe.each(['tfm', 'portal'])('When userType is %s', (userType) => {
    it('does not throw if id is a valid string', () => {
      const returnedValue = validateAuditDetails({ userType, id: '1234567890abcdef12345678' });

      expect(returnedValue).toBe(undefined);
    });

    it('does not throw if id is a valid ObjectId', () => {
      const returnedValue = validateAuditDetails({ userType, id: new ObjectId('1234567890abcdef12345678') });

      expect(returnedValue).toBe(undefined);
    });
  });

  describe('when userType is system', () => {
    it('does not throw', () => {
      const returnedValue = validateAuditDetails({ userType: 'system' });
      expect(returnedValue).toBe(undefined);
    });
  });
});

describe('validateAuditDetailsAndUserType', () => {
  describe('when validating userType is portal', () => {
    withValidateAuditDetailsTests((auditDetails) => validateAuditDetailsAndUserType(auditDetails, 'portal'));

    it('throws if the userType is tfm and id is a valid string', () => {
      expect(() => validateAuditDetailsAndUserType({ userType: 'tfm', id: '1234567890abcdef12345678' }, 'portal')).toThrow(`userType must be 'portal'`);
    });

    it('throws if the userType is tfm and id is a valid ObjectId', () => {
      expect(() => validateAuditDetailsAndUserType({ userType: 'tfm', id: new ObjectId('1234567890abcdef12345678') }, 'portal')).toThrow(
        `userType must be 'portal'`,
      );
    });

    it('throws if the userType is system', () => {
      expect(() => validateAuditDetailsAndUserType({ userType: 'system' }, 'portal')).toThrow(`userType must be 'portal'`);
    });

    it('does not throw if the userType is portal and id is a valid string', () => {
      const returnedValue = validateAuditDetailsAndUserType({ userType: 'portal', id: '1234567890abcdef12345678' }, 'portal');

      expect(returnedValue).toBe(undefined);
    });

    it('does not throw if the userType is portal and id is a valid ObjectId', () => {
      const returnedValue = validateAuditDetailsAndUserType({ userType: 'portal', id: new ObjectId('1234567890abcdef12345678') }, 'portal');

      expect(returnedValue).toBe(undefined);
    });
  });

  describe('when validating userType is tfm', () => {
    withValidateAuditDetailsTests((auditDetails) => validateAuditDetailsAndUserType(auditDetails, 'tfm'));

    it('throws if the userType is portal and id is a valid string', () => {
      expect(() => validateAuditDetailsAndUserType({ userType: 'portal', id: '1234567890abcdef12345678' }, 'tfm')).toThrow(`userType must be 'tfm'`);
    });

    it('throws if the userType is portal and id is a valid ObjectId', () => {
      expect(() => validateAuditDetailsAndUserType({ userType: 'portal', id: new ObjectId('1234567890abcdef12345678') }, 'tfm')).toThrow(
        `userType must be 'tfm'`,
      );
    });

    it('throws if the userType is system', () => {
      expect(() => validateAuditDetailsAndUserType({ userType: 'system' }, 'tfm')).toThrow(`userType must be 'tfm'`);
    });

    it('does not throw if the userType is tfm and input is a valid string', () => {
      const returnedValue = validateAuditDetailsAndUserType({ userType: 'tfm', id: '1234567890abcdef12345678' }, 'tfm');

      expect(returnedValue).toBe(undefined);
    });

    it('does not throw if the userType is tfm and input is a valid ObjectId', () => {
      const returnedValue = validateAuditDetailsAndUserType({ userType: 'tfm', id: new ObjectId('1234567890abcdef12345678') }, 'tfm');

      expect(returnedValue).toBe(undefined);
    });
  });

  describe('when validating userType is system', () => {
    withValidateAuditDetailsTests((auditDetails) => validateAuditDetailsAndUserType(auditDetails, 'system'));

    it('throws if the userType is tfm and id is a valid string', () => {
      expect(() => validateAuditDetailsAndUserType({ userType: 'tfm', id: '1234567890abcdef12345678' }, 'system')).toThrow(`userType must be 'system'`);
    });

    it('throws if the userType is tfm and id is a valid ObjectId', () => {
      expect(() => validateAuditDetailsAndUserType({ userType: 'tfm', id: new ObjectId('1234567890abcdef12345678') }, 'system')).toThrow(
        `userType must be 'system'`,
      );
    });

    it('throws if the userType is portal and id is a valid string', () => {
      expect(() => validateAuditDetailsAndUserType({ userType: 'portal', id: '1234567890abcdef12345678' }, 'system')).toThrow(`userType must be 'system'`);
    });

    it('throws if the userType is portal and id is a valid ObjectId', () => {
      expect(() => validateAuditDetailsAndUserType({ userType: 'portal', id: new ObjectId('1234567890abcdef12345678') }, 'system')).toThrow(
        `userType must be 'system'`,
      );
    });

    it('does not throw if the userType is system', () => {
      const returnedValue = validateAuditDetailsAndUserType({ userType: 'system' }, 'system');

      expect(returnedValue).toBe(undefined);
    });
  });
});

function withValidateAuditDetailsTests(validationFunction: (auditDetails: unknown) => void) {
  describe('when validating invalid userDetails', () => {
    it('throws if the input is not an object', () => {
      expect(() => validationFunction('test')).toThrow('Missing property `userType`');
    });

    it('throws if the input has no property userType', () => {
      expect(() => validationFunction({})).toThrow('Missing property `userType`');
    });

    it('throws if the userType is not portal, tfm or system', () => {
      expect(() => validationFunction({ userType: 'abcd1234' })).toThrow('Invalid userType abcd1234');
    });

    describe.each(['tfm', 'portal'])('When userType is %s', (userType) => {
      it('throws if id property is missing', () => {
        expect(() => validationFunction({ userType })).toThrow(`Missing property id for ${userType} user`);
      });

      it('throws if id property is not a string or Object id', () => {
        expect(() => validationFunction({ userType, id: 1234 })).toThrow(`Invalid ${userType} user id 1234`);
      });

      it('throws if id property is a string but invalid ObjectId', () => {
        expect(() => validationFunction({ userType, id: '1234' })).toThrow(`Invalid ${userType} user id 1234`);
      });
    });
  });
}
