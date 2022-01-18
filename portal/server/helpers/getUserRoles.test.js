const getUserRoles = require('./getUserRoles');

describe('getUserRoles', () => {
  describe('isMaker', () => {
    it('should true when roles includes maker', () => {
      const result = getUserRoles(['maker']);

      expect(result.isMaker).toEqual(true);
    });

    it('should false when roles does NOT include maker', () => {
      const result = getUserRoles(['']);

      expect(result.isMaker).toEqual(false);
    });
  });

  describe('isChecker', () => {
    it('should true when roles includes checker', () => {
      const result = getUserRoles(['checker']);

      expect(result.isChecker).toEqual(true);
    });

    it('should false when roles does NOT include checker', () => {
      const result = getUserRoles(['']);

      expect(result.isChecker).toEqual(false);
    });
  });
});
