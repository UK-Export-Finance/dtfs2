const { MAKER, CHECKER } = require('../constants/roles');
const getUserRoles = require('./getUserRoles');

describe('getUserRoles', () => {
  function isRoleTests(isRole, role) {
    describe(isRole, () => {
      it(`should return true when roles includes ${role}`, () => {
        const result = getUserRoles([role]);

        expect(result[isRole]).toEqual(true);
      });
      
      it(`should return false when roles does NOT include ${role}`, () => {
        const result = getUserRoles(['']);

        expect(result[isRole]).toEqual(false);
      });
    });
  }

  isRoleTests('isMaker', MAKER);

  isRoleTests('isChecker', CHECKER);
});
