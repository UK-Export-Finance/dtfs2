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

  function isReadOnlyForRoleTests(isReadOnlyForRole, role) {
    describe(isReadOnlyForRole, () => {
      it(`should true when roles does NOT include ${role} and roles includes read-only`, () => {
        const result = getUserRoles(['read-only']);

        expect(result[isReadOnlyForRole]).toEqual(true);
      });
      it(`should false when roles includes ${role} and roles includes read-only`, () => {
        const result = getUserRoles([role, 'read-only']);

        expect(result[isReadOnlyForRole]).toEqual(false);
      });
      it(`should false when roles does NOT include ${role} and roles does NOT include read-only`, () => {
        const result = getUserRoles(['']);

        expect(result[isReadOnlyForRole]).toEqual(false);
      });
      it(`should false when roles includes ${role} and roles does NOT include read-only`, () => {
        const result = getUserRoles([role]);

        expect(result[isReadOnlyForRole]).toEqual(false);
      });
    });
  }

  isRoleTests('isMaker', 'maker');

  isRoleTests('isChecker', 'checker');

  isRoleTests('isReadOnly', 'read-only');

  isReadOnlyForRoleTests('isReadOnlyForMaker', 'maker');

  isReadOnlyForRoleTests('isReadOnlyForChecker', 'checker');
});
