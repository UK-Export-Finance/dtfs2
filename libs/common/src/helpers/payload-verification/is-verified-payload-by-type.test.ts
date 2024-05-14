import { isVerifiedPayloadByType } from './is-verified-payload-by-type';

describe('isVerifiedPayloadByType', () => {
  const makeIsVerifiedPayloadRequest = isVerifiedPayloadByType;
  const testCases = {
    nameAndAge: { name: 'string', age: 'number' },
    nameAndAddress: { name: 'string', address: 'object' },
    nameAndAddressGeneric: { name: 'string', address: 'object' },
    nameAndAddressIncorrect: { name: 'string', address: 'string' },
    items: { items: 'object' },
    itemsGeneric: { items: 'object' },
  };

  describe('when all fields are required', () => {
    const options = {
      areAllPropertiesRequired: true,
    };
    withGeneralSuccessTestCases(options);

    withGeneralFailureTestCases(options);

    it('should return false when field is present in template but not in payload', () => {
      const payload = { name: 'First' };
      const template = testCases.nameAndAge;
      const result = makeIsVerifiedPayloadRequest({
        payload,
        template,
        areAllPropertiesRequired: options.areAllPropertiesRequired,
      });
      expect(result).toBe(false);
    });
  });

  describe('when all fields are not required', () => {
    const options = {
      areAllPropertiesRequired: false,
    };
    withGeneralSuccessTestCases(options);

    withGeneralFailureTestCases(options);

    it('should return true when field is present in template but not in payload', () => {
      const payload = { name: 'First' };
      const template = testCases.nameAndAge;
      const result = makeIsVerifiedPayloadRequest({
        payload,
        template,
        areAllPropertiesRequired: options.areAllPropertiesRequired,
      });
      expect(result).toBe(true);
    });
  });

  type TestOptions = {
    areAllPropertiesRequired: boolean;
  };

  function withGeneralSuccessTestCases({ areAllPropertiesRequired }: TestOptions) {
    const successTestCases = [
      {
        payload: { name: 'First', age: 30 },
        template: testCases.nameAndAge,
        description: 'when payload and template have the same properties and data types',
      },
      {
        payload: { name: 'First', address: { city: 'London', country: 'UK' } },
        template: testCases.nameAndAddress,
        description: 'when payload and template have nested objects with same properties and data types',
      },
      {
        payload: { name: 'First', address: { city: 'London', country: 'UK' } },
        template: testCases.nameAndAddressGeneric,
        description: 'when payload and template have nested objects with the template checking for a generic object',
      },
      {
        payload: { items: [1, 2, 3] },
        template: testCases.items,
        description: 'when payload and template have arrays with same data types',
      },
      {
        payload: { items: [1, 2, 3] },
        template: testCases.itemsGeneric,
        description: 'when payload and template have arrays with the template checking for a generic array',
      },
    ];

    it.each(successTestCases)('should return true $description', ({ payload, template }) => {
      const result = makeIsVerifiedPayloadRequest({ payload, template, areAllPropertiesRequired });
      expect(result).toBe(true);
    });
  }

  function withGeneralFailureTestCases({ areAllPropertiesRequired }: TestOptions) {
    const failureTestCases = [
      {
        payload: { name: 'Test', age: '30' },
        template: testCases.nameAndAge,
        description: 'when payload and template have a missmatch of datatypes (number and string)',
      },
      {
        payload: { name: 'First', address: { city: 'London', country: 'UK' } },
        template: testCases.nameAndAddressIncorrect,
        description: 'when payload and template have a missmatch of datatypes (object and string)',
      },
      {
        payload: { name: 'First', address: { city: 'London', country: 'UK' }, age: 30 },
        template: testCases.nameAndAddress,
        description: 'when payload has additional properties not present in the template',
      },
    ];

    it.each(failureTestCases)('should return false $description', ({ payload, template }) => {
      const result = makeIsVerifiedPayloadRequest({ payload, template, areAllPropertiesRequired });
      expect(result).toBe(false);
    });
  }
});
