import { isVerifiedPayloadByType } from './is-verified-payload-by-type';

describe('isVerifiedPayloadByType', () => {
  const templates = {
    nameAndAge: { name: 'string', age: 'number' },
    nameAndAddressGeneric: { name: 'string', address: 'object' },
    nameAndAddressIncorrect: { name: 'string', address: 'string' },
    itemsGeneric: { items: 'object' },
    itemsNull: { items: 'null' },
  };

  const successTestCases = [
    {
      payload: { name: 'First', age: 30 },
      template: templates.nameAndAge,
      description: 'when payload and template have the same properties and data types',
    },
    {
      payload: { name: 'First', address: { city: 'London', country: 'UK' } },
      template: templates.nameAndAddressGeneric,
      description: 'when payload and template have nested objects with the template checking for a generic object',
    },
    {
      payload: { items: [1, 2, 3] },
      template: templates.itemsGeneric,
      description: 'when payload and template have arrays with the template checking for a generic array',
    },
  ];

  const failureTestCases = [
    {
      payload: { name: 'Test', age: '30' },
      template: templates.nameAndAge,
      description: 'when payload and template have a missmatch of datatypes (number and string)',
    },
    {
      payload: { name: 'First', address: { city: 'London', country: 'UK' } },
      template: templates.nameAndAddressIncorrect,
      description: 'when payload and template have a missmatch of datatypes (object and string)',
    },
    {
      payload: { name: 'First', address: { city: 'London', country: 'UK' }, age: 30 },
      template: templates.nameAndAddressGeneric,
      description: 'when payload has additional properties not present in the template',
    },
    {
      payload: { name: 'First' },
      template: templates.nameAndAge,
      description: 'when field is present in template but not in payload',
    },
  ];

  it.each(successTestCases)('should return true $description', ({ payload, template }) => {
    const result = isVerifiedPayloadByType({ payload, template });
    expect(result).toBe(true);
  });

  it.each(failureTestCases)('should return false $description', ({ payload, template }) => {
    const result = isVerifiedPayloadByType({ payload, template });
    expect(result).toBe(false);
  });
});
