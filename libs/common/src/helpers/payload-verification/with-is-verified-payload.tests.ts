import z from 'zod';
import { IsVerifiedPayloadParams, TemplateByType } from '../../types/payload-verification';
import { get } from 'axios';

type MakeIsVerifiedPayloadRequest = ({
  payload,
  template,
  areAllPropertiesRequired,
}: IsVerifiedPayloadParams) => boolean;

type TestOptions = {
  areAllPropertiesRequired: boolean;
};

interface TestCase<T> {
  nameAndAge: T;
  nameAndAddress: T;
  nameAndAddressGeneric: T;
  nameAndAddressIncorrect: T;
  items: T;
  itemsGeneric: T;
}

const byTypeTestCases: TestCase<TemplateByType> = {
  nameAndAge: { name: 'string', age: 'number' },
  nameAndAddress: { name: 'string', address: 'object' },
  nameAndAddressGeneric: { name: 'string', address: 'object' },
  nameAndAddressIncorrect: { name: 'string', address: 'string' },
  items: { items: 'object' },
  itemsGeneric: { items: 'object' },
};

const byZodTestCases: TestCase<z.AnyZodObject> = {
  nameAndAge: z.object({ name: z.string(), age: z.number() }),
  nameAndAddress: z.object({
    name: z.string(),
    address: z.object({ city: z.string(), country: z.string() }),
  }),
  nameAndAddressGeneric: z.object({ name: z.string(), address: z.object({}) }),
  nameAndAddressIncorrect: z.object({ name: z.string(), address: z.string() }),
  items: z.object({ items: z.array(z.number()) }),
  itemsGeneric: z.object({ items: z.array(z.unknown()) }),
};

const getTestCases = (verificationType: 'zod' | 'type') => {
  if (verificationType === 'zod') {
    return byZodTestCases;
  }
  return byTypeTestCases;
};

export const withVerifiedPayloadTests = <T extends 'zod' | 'type'>({
  verificationType,
  makePayloadRequest,
}: {
  verificationType: T;
  makePayloadRequest: MakeIsVerifiedPayloadRequest;
}) => {
  const testCases = getTestCases(verificationType);

  describe('isVerifiedPayload', () => {
    describe('when all fields are required', () => {
      const options = {
        areAllPropertiesRequired: true,
      };
      withGeneralSuccessTestCases(options);

      withGeneralFailureTestCases(options);

      it('should return false when field is present in template but not in payload', () => {
        const payload = { name: 'First' };
        const template = testCases.nameAndAge;
        const result = makePayloadRequest({
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
        const result = makePayloadRequest({
          payload,
          template,
          areAllPropertiesRequired: options.areAllPropertiesRequired,
        });
        expect(result).toBe(true);
      });
    });

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
        const result = makePayloadRequest({ payload, template, areAllPropertiesRequired });
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
        const result = makePayloadRequest({ payload, template, areAllPropertiesRequired });
        expect(result).toBe(false);
      });
    }
  });
};
