const { ROLES } = require('@ukef/dtfs2-common');
const getUserRoles = require('./getUserRoles');

const { MAKER, CHECKER, ADMIN, READ_ONLY, PAYMENT_REPORT_OFFICER } = ROLES;

describe('getUserRoles', () => {
  const allRoles = [MAKER, CHECKER, ADMIN, READ_ONLY, PAYMENT_REPORT_OFFICER];

  describe.each([
    ['isMaker', MAKER],
    ['isChecker', CHECKER],
    ['isAdmin', ADMIN],
    ['isReadOnly', READ_ONLY],
    ['isPaymentReportOfficer', PAYMENT_REPORT_OFFICER],
  ])('%s', (isTestRole, testRole) => {
    it(`should return true when roles includes ${testRole}`, () => {
      const result = getUserRoles([testRole]);

      expect(result[isTestRole]).toEqual(true);
    });

    it(`should return false when roles does NOT include ${testRole}`, () => {
      const allRolesExceptTestRole = allRoles.filter((role) => role !== testRole);
      const result = getUserRoles(allRolesExceptTestRole);

      expect(result[isTestRole]).toEqual(false);
    });
  });

  it('should return false for all entries when roles is empty', () => {
    const result = getUserRoles([]);

    Object.values(result).forEach((value) => expect(value).toEqual(false));
  });

  it('should return false for all entries when roles is null', () => {
    const result = getUserRoles(null);

    Object.values(result).forEach((value) => expect(value).toEqual(false));
  });

  it('should return false for all entries when roles is undefined', () => {
    const result = getUserRoles(undefined);

    Object.values(result).forEach((value) => expect(value).toEqual(false));
  });
});
