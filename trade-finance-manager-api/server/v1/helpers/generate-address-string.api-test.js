const { generateCleanAddressArray, generateAddressString } = require('./generate-address-string');

describe('generate-address-string', () => {
  const mockAddressObj = {
    organisationName: null,
    addressLine1: 'Line 1',
    addressLine2: 'Line 2',
    addressLine3: null,
    locality: 'Mock locality',
    postalCode: 'Mock postcode',
    country: null,
  };

  describe('generateCleanAddressArray', () => {
    it('should remove any null or empty values', () => {
      const result = generateCleanAddressArray(mockAddressObj);

      const expected = [mockAddressObj.addressLine1, mockAddressObj.addressLine2, mockAddressObj.locality, mockAddressObj.postalCode];

      expect(result).toEqual(expected);
    });
  });

  describe('generateAddressString', () => {
    it('should return a string with comma and space seperated values', () => {
      const result = generateAddressString(mockAddressObj);

      const [value1, value2, value3, value4] = generateCleanAddressArray(mockAddressObj);

      const expected = `${value1}, ${value2}, ${value3}, ${value4}`;

      expect(result).toEqual(expected);
    });
  });
});
