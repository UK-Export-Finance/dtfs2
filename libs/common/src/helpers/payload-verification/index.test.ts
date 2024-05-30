import z from 'zod';
import { isVerifiedPayload } from '.';
import { isVerifiedPayloadByZod } from './is-verified-payload-by-zod';
import { isVerifiedPayloadByType } from './is-verified-payload-by-type';

jest.mock('./is-verified-payload-by-type', () => ({
  isVerifiedPayloadByType: jest.fn(),
}));

jest.mock('./is-verified-payload-by-zod', () => ({
  isVerifiedPayloadByZod: jest.fn(),
}));

describe('isVerifiedPayload', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when a zod object is passed as a template', () => {
    it('should call isVerifiedPayloadByZod with the correct parameters', () => {
      const payload = { name: 'First', age: 30 };
      const template = z.object({ name: z.string(), age: z.number() });

      isVerifiedPayload({ payload, template });

      expect(isVerifiedPayloadByZod).toHaveBeenCalledWith({ payload, template });
    });

    it('should not call isVerifiedPayloadByType', () => {
      const payload = { name: 'First', age: 30 };
      const template = z.object({ name: z.string(), age: z.number() });

      isVerifiedPayload({ payload, template });

      expect(isVerifiedPayloadByType).not.toHaveBeenCalled();
    });
  });

  describe('when a type object is passed as a template', () => {
    it('should call isVerifiedPayloadByType with the correct parameters', () => {
      const payload = { name: 'First', age: 30 };
      const template = { name: 'string', age: 'number' };

      isVerifiedPayload({ payload, template });

      expect(isVerifiedPayloadByType).toHaveBeenCalledWith({ payload, template });
    });

    it('should not call isVerifiedPayloadByZod', () => {
      const payload = { name: 'First', age: 30 };
      const template = { name: 'string', age: 'number' };

      isVerifiedPayload({ payload, template });

      expect(isVerifiedPayloadByZod).not.toHaveBeenCalled();
    });
  });
});
