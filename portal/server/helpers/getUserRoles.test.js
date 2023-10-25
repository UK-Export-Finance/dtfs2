const { MAKER, CHECKER, ADMIN, READ_ONLY, PAYMENT_REPORT_OFFICER } = require('../constants/roles');
const getUserRoles = require('./getUserRoles');

describe('getUserRoles', () => {
  function isRoleTests(isRole, role) {
    describe(isRole, () => {
      it(`should return true when roles includes ${role}`, () => {
        const result = getUserRoles([role]);

        expect(result[isRole]).toEqual(true);
      });

      it(`should return false when roles does NOT include ${role}`, () => {
        const result = getUserRoles([]);

        expect(result[isRole]).toEqual(false);
      });
    });
  }

  isRoleTests('isMaker', MAKER);
  isRoleTests('isChecker', CHECKER);
  isRoleTests('isAdmin', ADMIN);
  isRoleTests('isReadOnly', READ_ONLY);
  isRoleTests('isPaymentReportOfficer', PAYMENT_REPORT_OFFICER);

  it('should return false for all entries when roles is null', () => {
    const result = getUserRoles(null);

    Object.values(result).forEach((value) => expect(value).toEqual(false));
  });

  it('should return false for all entries when roles is undefined', () => {
    const result = getUserRoles(undefined);

    Object.values(result).forEach((value) => expect(value).toEqual(false));
  });
});