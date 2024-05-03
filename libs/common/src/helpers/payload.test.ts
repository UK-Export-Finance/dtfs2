import z from 'zod';
import { isVerifiedPayload } from './payload';

type isVerifiedPayloadParams = { payload: object; template: z.AnyZodObject };
type makeIsVerifiedPayloadRequest = ({ payload, template }: isVerifiedPayloadParams) => boolean;

describe('isVerifiedPayload', () => {
  describe('when all fields are required', () => {
    const makePayloadRequest = ({ payload, template }: isVerifiedPayloadParams) =>
      isVerifiedPayload({ payload, template, areAllPropertiesRequired: true });

    withGeneralSuccessTestCases(makePayloadRequest);

    withGeneralFailureTestCases(makePayloadRequest);

    it('should return false when field is present in template but not in payload', () => {
      const payload = { name: 'First' };
      const template = z.object({ name: z.string(), age: z.number() });
      const result = makePayloadRequest({ payload, template });
      expect(result).toBe(false);
    });
  });

  describe('when all fields are not required', () => {
    const makePayloadRequest = ({ payload, template }: isVerifiedPayloadParams) =>
      isVerifiedPayload({ payload, template, areAllPropertiesRequired: false });

    withGeneralSuccessTestCases(makePayloadRequest);

    withGeneralFailureTestCases(makePayloadRequest);

    it('should return true when field is present in template but not in payload', () => {
      const payload = { name: 'First' };
      const template = z.object({ name: z.string(), age: z.number() });
      const result = makePayloadRequest({ payload, template });
      expect(result).toBe(true);
    });
  });

  function withGeneralSuccessTestCases(makePayloadRequest: makeIsVerifiedPayloadRequest) {
    const successTestCases = [
      {
        payload: { name: 'First', age: 30 },
        template: z.object({ name: z.string(), age: z.number() }),
        description: 'when payload and template have the same properties and data types',
      },
      {
        payload: { name: 'First', address: { city: 'London', country: 'UK' } },
        template: z.object({ name: z.string(), address: z.object({ city: z.string(), country: z.string() }) }),
        description: 'when payload and template have nested objects with same properties and data types',
      },
      {
        payload: { name: 'First', address: { city: 'London', country: 'UK' } },
        template: z.object({ name: z.string(), address: z.object({}) }),
        description: 'when payload and template have nested objects with the template checking for a generic object',
      },
      {
        payload: { items: [1, 2, 3] },
        template: z.object({ items: z.array(z.number()) }),
        description: 'when payload and template have arrays with same data types',
      },
      {
        payload: { items: [1, 2, 3] },
        template: z.object({ items: z.array(z.number()) }),
        description: 'when payload and template have arrays with the template checking for a generic array',
      },
    ];

    it.each(successTestCases)('should return true $description', ({ payload, template }) => {
      const result = makePayloadRequest({ payload, template });
      expect(result).toBe(true);
    });
  }

  function withGeneralFailureTestCases(makePayloadRequest: makeIsVerifiedPayloadRequest) {
    const failureTestCases = [
      {
        payload: { name: 'Test', age: '30' },
        template: z.object({ name: z.string(), age: z.number() }),
        description: 'when payload and template have a missmatch of datatypes (number and string)',
      },
      {
        payload: { name: 'First', address: { city: 'London', country: 'UK' } },
        template: z.object({ name: z.string(), address: z.string() }),
        description: 'when payload and template have a missmatch of datatypes (object and string)',
      },
      {
        payload: { name: 'First', address: { city: 'London', country: 'UK' }, age: 30 },
        template: z.object({ name: z.string(), address: z.string() }),
        description: 'when payload has additional properties not present in the template',
      },
    ];

    it.each(failureTestCases)('should return false $description', ({ payload, template }) => {
      const result = makePayloadRequest({ payload, template });
      expect(result).toBe(false);
    });
  }
});
