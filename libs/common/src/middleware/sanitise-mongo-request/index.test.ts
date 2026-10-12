import httpMocks from 'node-mocks-http';
import mongoSanitise from 'express-mongo-sanitize';
import { canBeSanitised, sanitiseMongoRequest } from './index';

describe('middleware/sanitise-mongo-request', () => {
  describe('canBeSanitised', () => {
    it.each([
      [{ key: 'value' }, true],
      [[], true],
      [null, false],
      [undefined, false],
      ['text', false],
      [123, false],
      [true, false],
    ])('returns %s for %p', (value, expected) => {
      expect(canBeSanitised(value)).toBe(expected);
    });
  });

  describe('sanitiseMongoRequest', () => {
    const sanitizeSpy = jest.spyOn(mongoSanitise, 'sanitize').mockImplementation((target) => target);
    const getHttpMocks = () => httpMocks.createMocks();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should sanitise body, params, headers and query when they are sanitiseable', () => {
      const { req, res } = getHttpMocks();
      req.body = { $where: 'danger' };
      req.params = { id: '1' };
      req.headers['x-custom-header'] = 'value';
      req.query = { filter: 'abc' };
      const next = jest.fn();

      sanitiseMongoRequest(req, res, next);

      expect(sanitizeSpy).toHaveBeenCalledTimes(4);
      expect(sanitizeSpy).toHaveBeenNthCalledWith(1, req.body, { allowDots: true });
      expect(sanitizeSpy).toHaveBeenNthCalledWith(2, req.params, { allowDots: true });
      expect(sanitizeSpy).toHaveBeenNthCalledWith(3, req.headers, { allowDots: true });
      expect(sanitizeSpy).toHaveBeenNthCalledWith(4, req.query, { allowDots: true });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should skip non-sanitiseable values and still call next', () => {
      const { req, res } = getHttpMocks();
      req.body = 'plain text';
      req.params = 42 as unknown as Record<string, string>;
      req.query = undefined as unknown as Record<string, string>;
      const next = jest.fn();

      sanitiseMongoRequest(req, res, next);

      expect(sanitizeSpy).toHaveBeenCalledTimes(1);
      expect(sanitizeSpy).toHaveBeenNthCalledWith(1, req.headers, { allowDots: true });
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
