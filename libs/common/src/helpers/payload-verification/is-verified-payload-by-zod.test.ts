import zod from 'zod';
import { isVerifiedPayloadByZod } from './is-verified-payload-by-zod';

describe('isVerifiedPayloadByZod', () => {
  const templates = {
    nameAndAge: zod.object({ name: zod.string(), age: zod.number() }),
    nameAndAddress: zod.object({
      name: zod.string(),
      address: zod.object({ city: zod.string(), country: zod.string() }),
    }),
    nameAndAddressGeneric: zod.object({ name: zod.string(), address: zod.object({}) }),
    nameAndAddressIncorrect: zod.object({ name: zod.string(), address: zod.string() }),
    items: zod.object({ items: zod.array(zod.number()) }),
    itemsGeneric: zod.object({ items: zod.array(zod.unknown()) }),
  };

  const successTestCases = [
    {
      payload: { name: 'First', age: 30 },
      template: templates.nameAndAge,
      description: 'when payload and template have the same properties and data types',
    },
    {
      payload: { name: 'First', address: { city: 'London', country: 'UK' } },
      template: templates.nameAndAddress,
      description: 'when payload and template have nested objects with same properties and data types',
    },
    {
      payload: { name: 'First', address: { city: 'London', country: 'UK' } },
      template: templates.nameAndAddressGeneric,
      description: 'when payload and template have nested objects with the template checking for a generic object',
    },
    {
      payload: { items: [1, 2, 3] },
      template: templates.items,
      description: 'when payload and template have arrays with same data types',
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
      payload: { name: 'First' },
      template: templates.nameAndAge,
      description: 'when field is present in template but not in payload',
    },
  ];

  it.each(successTestCases)('should return true $description', ({ payload, template }) => {
    const result = isVerifiedPayloadByZod({ payload, template });
    expect(result).toEqual(true);
  });

  it.each(failureTestCases)('should return false $description', ({ payload, template }) => {
    const result = isVerifiedPayloadByZod({ payload, template });
    expect(result).toEqual(false);
  });
});
