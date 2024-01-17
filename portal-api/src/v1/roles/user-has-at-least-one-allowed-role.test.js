const { userHasAtLeastOneAllowedRole } = require('./user-has-at-least-one-allowed-role');
const { MAKER, CHECKER, ADMIN, READ_ONLY } = require('./roles');

const allRoles = [MAKER, CHECKER, READ_ONLY, ADMIN];

describe('userHasAtLeastOneAllowedRole', () => {
  describe('when there are no allowed roles', () => {
    const allowedRoles = [];

    it('returns false if the user has no roles', () => {
      const allowed = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [] },
      });

      expect(allowed).toBe(false);
    });

    it.each(allRoles)('returns false if the user has the %s role', (userRole) => {
      const allowed = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [userRole] },
      });

      expect(allowed).toBe(false);
    });
  });

  describe.each(allRoles)('when the only allowed role is %s', (allowedRole) => {
    const allowedRoles = [allowedRole];

    it('returns false if the user has no roles', () => {
      const allowed = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [] },
      });

      expect(allowed).toBe(false);
    });

    const nonMatchingRoles = allRoles.filter((role) => role !== allowedRole);
    it.each(nonMatchingRoles)('returns false if the user has the %s role', (userRole) => {
      const allowed = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [userRole] },
      });

      expect(allowed).toBe(false);
    });

    it(`returns true if the user has the ${allowedRole} role only`, () => {
      const allowed = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [allowedRole] },
      });

      expect(allowed).toBe(true);
    });

    it.each(nonMatchingRoles)(`returns true if the user has the ${allowedRole} role and the %s role in either order`, (userRole) => {
      const allowedWithAllowedRoleFirst = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [allowedRole, userRole] },
      });
      const allowedWithAllowedRoleSecond = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [userRole, allowedRole] },
      });

      expect(allowedWithAllowedRoleFirst).toBe(true);
      expect(allowedWithAllowedRoleSecond).toBe(true);
    });
  });

  describe('when there are multiple allowed roles', () => {
    const allowedRoles = [MAKER, READ_ONLY];
    const notAllowedRole = CHECKER;

    it('returns false if the user has no roles', () => {
      const allowed = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [] },
      });

      expect(allowed).toBe(false);
    });

    it('returns false if the user has none of the allowed roles', () => {
      const allowed = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [notAllowedRole] },
      });

      expect(allowed).toBe(false);
    });

    it('returns true if the user has one of the allowed roles', () => {
      const allowed = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [allowedRoles[0]] },
      });

      expect(allowed).toBe(true);
    });

    it('returns true if the user has multiple of the allowed roles', () => {
      const allowed = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [allowedRoles[0], allowedRoles[1]] },
      });

      expect(allowed).toBe(true);
    });

    it('returns true if the user has an allowed role and another role in either order', () => {
      const allowedWithAllowedRoleFirst = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [allowedRoles[1], notAllowedRole] },
      });
      const allowedWithAllowedRoleSecond = userHasAtLeastOneAllowedRole({
        allowedRoles,
        user: { roles: [notAllowedRole, allowedRoles[1]] },
      });

      expect(allowedWithAllowedRoleFirst).toBe(true);
      expect(allowedWithAllowedRoleSecond).toBe(true);
    });
  });
});
