const { convertUserFormDataToRequest } = require('./convertUserFormDataToRequest');

describe('convertUserFormDataToRequest', () => {
  describe('when handing roles', () => {
    it('should return an array when roles is a string', () => {
      const user = { roles: 'admin' };
      const result = convertUserFormDataToRequest(user);
      expect(result.roles).toEqual(['admin']);
    });

    it('should return an array when roles is an array', () => {
      const user = { roles: ['admin'] };
      const result = convertUserFormDataToRequest(user);
      expect(result.roles).toEqual(['admin']);
    });

    it('should return an empty array when roles is undefined', () => {
      const user = {};
      const result = convertUserFormDataToRequest(user);
      expect(result.roles).toEqual([]);
    });
  });

  describe('when handling isTrusted', () => {
    it('should return true when isTrusted is "true"', () => {
      const user = { isTrusted: 'true' };
      const result = convertUserFormDataToRequest(user);
      expect(result.isTrusted).toBe(true);
    });

    it('should return false when isTrusted is "false"', () => {
      const user = { isTrusted: 'false' };
      const result = convertUserFormDataToRequest(user);
      expect(result.isTrusted).toBe(false);
    });

    it('should return undefined when isTrusted is undefined', () => {
      const user = {};
      const result = convertUserFormDataToRequest(user);
      expect(result.isTrusted).toBe(undefined);
    });
  });

  describe('when handling email/username', () => {
    it('should return username as email', () => {
      const user = { email: 'example@ukexportfinance.gov.uk' };
      const result = convertUserFormDataToRequest(user);
      expect(result.username).toBe('example@ukexportfinance.gov.uk');
    });

    it('should return username as undefined when email is undefined', () => {
      const user = {};
      const result = convertUserFormDataToRequest(user);
      expect(result.email).toBe(undefined);
    });
  });
});
