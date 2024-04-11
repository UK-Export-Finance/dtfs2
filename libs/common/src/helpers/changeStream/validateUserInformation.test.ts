import { ObjectId } from 'mongodb';
import { validateUserInformation } from './validateUserInformation';

describe('validateUserInformation', () => {
  it('throws if the input is not an object', () => {
    expect(() => validateUserInformation('test')).toThrow('Missing property `userType`');
  });

  it('throws if the input has no property userType', () => {
    expect(() => validateUserInformation({})).toThrow('Missing property `userType`');
  });

  it('throws if the userType is not portal, tfm or system', () => {
    expect(() => validateUserInformation({ userType: 'abcd1234' })).toThrow('Invalid userType abcd1234');
  });

  describe.each(['tfm', 'portal'])('When userType is %s', (userType) => {
    it('throws if id property is missing', () => {
      expect(() => validateUserInformation({ userType })).toThrow(`Missing property id for ${userType} user`);
    });

    it('throws if id property is not a string or Object id', () => {
      expect(() => validateUserInformation({ userType, id: 1234 })).toThrow(`Invalid ${userType} user id 1234`);
    });

    it('throws if id property is a string but invalid ObjectId', () => {
      expect(() => validateUserInformation({ userType, id: '1234' })).toThrow(`Invalid ${userType} user id 1234`);
    });

    it('does not throw if id is a valid string', () => {
      const returnedValue = validateUserInformation({ userType, id: '1234567890abcdef12345678' });

      expect(returnedValue).toBe(undefined);
    });

    it('does not throw if id is a valid ObjectId', () => {
      const returnedValue = validateUserInformation({ userType, id: new ObjectId('1234567890abcdef12345678') });

      expect(returnedValue).toBe(undefined);
    });
  });

  describe('when userType is system', () => {
    it('does not throw', () => {
      const returnedValue = validateUserInformation({ userType: 'system' });
      expect(returnedValue).toBe(undefined);
    });
  });
});
