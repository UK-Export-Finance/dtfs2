const { MAKER, CHECKER, READ_ONLY } = require('../constants/roles');
const getUserRoles = require('./getUserRoles');

describe('getUserRoles', () => {
  function isRoleTests(isRole, role) {
    describe(isRole, () => {
      it(`should true when roles includes ${role}`, () => {
        const result = getUserRoles([role]);

        expect(result[isRole]).toEqual(true);
      });
      it(`should false when roles does NOT include ${role}`, () => {
        const result = getUserRoles(['']);

        expect(result[isRole]).toEqual(false);
      });
    });
  }

  isRoleTests('isMaker', MAKER);

  isRoleTests('isChecker', CHECKER);
});
