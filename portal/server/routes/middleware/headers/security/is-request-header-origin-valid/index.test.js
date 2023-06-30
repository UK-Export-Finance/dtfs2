const isRequestHeaderOriginValid = require('.');
const { mockReq } = require('../../../../../test-mocks');

const mockOrigin = mockReq().hostname;

describe('middleware/headers/security/get-url-origin', () => {
  describe('when the provided request header matches the origin', () => {
    it('should return true', () => {
      const mockRequestHeader = `https://${mockReq().hostname}.com`;

      const result = isRequestHeaderOriginValid(
        mockOrigin,
        mockRequestHeader,
      );

      expect(result).toEqual(true);
    });
  });

  describe('when the provided request header does NOT mach the origin', () => {
    it('should return false', () => {
      const mockRequestHeader = `https://${mockReq().hostname}-invalid.com`;

      const result = isRequestHeaderOriginValid(
        mockOrigin,
        mockRequestHeader,
      );

      expect(result).toEqual(false);
    });
  });

  describe('when the provided request header is not a valid url', () => {
    it('should return false', () => {
      const mockRequestHeader = 'invalid-url';

      const result = isRequestHeaderOriginValid(
        mockOrigin,
        mockRequestHeader,
      );

      expect(result).toEqual(false);
    });
  });
});
