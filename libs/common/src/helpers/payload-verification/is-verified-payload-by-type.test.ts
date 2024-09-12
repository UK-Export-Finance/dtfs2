import { IsVerifiedPayloadByTypeParams } from '../../types/payload-verification';
import { isVerifiedPayloadByType } from './is-verified-payload-by-type';

console.error = jest.fn();

describe('isVerifiedPayloadByType', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

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
      payload: {},
      template: templates.nameAndAge,
      description: 'when payload is empty',
      expectedErrorLog: 'no data',
    },
    {
      payload: { name: 'First' },
      template: {},
      description: 'when template is empty',
      expectedErrorLog: 'no data',
    },
    {
      payload: { name: 'First', age: '30' },
      template: templates.nameAndAge,
      description: 'when payload and template have a mismatch of datatypes (number and string)',
      expectedErrorLog: 'type mismatch: age (expected number, got string)',
    },
    {
      payload: { name: 'First', address: { city: 'London', country: 'UK' } },
      template: templates.nameAndAddressIncorrect,
      description: 'when payload and template have a mismatch of datatypes (object and string)',
      expectedErrorLog: 'type mismatch: address (expected string, got object)',
    },
    {
      payload: { name: 'First', address: { city: 'London', country: 'UK' }, age: 30 },
      template: templates.nameAndAddressGeneric,
      description: 'when payload has additional properties not present in the template',
      expectedErrorLog: 'extra property: age',
    },
    {
      payload: { name: 'First' },
      template: templates.nameAndAge,
      description: 'when field is present in template but not in payload',
      expectedErrorLog: 'missing property: age',
    },
    {
      payload: { name: 123, address: 'Colchester' },
      template: templates.nameAndAge,
      description: 'when there are multiple validation errors',
      expectedErrorLog: 'missing property: age\ntype mismatch: name (expected string, got number)\nextra property: address',
    },
  ];

  it.each(successTestCases)('should return true $description', ({ payload, template }) => {
    const result = isVerifiedPayloadByType({ payload, template });
    expect(result).toBe(true);
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each(failureTestCases)('should return false $description', ({ payload, template, expectedErrorLog }) => {
    const result = isVerifiedPayloadByType({ payload, template } as IsVerifiedPayloadByTypeParams);
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Payload verification error:\n%s', expectedErrorLog);
  });
});
