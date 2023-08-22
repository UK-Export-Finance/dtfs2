const { userHasSufficientRole } = require('./user-has-sufficient-role');
const { MAKER, CHECKER, ADMIN, READ_ONLY, UKEF_OPERATIONS } = require('./roles');

const adminRoles = [
  UKEF_OPERATIONS
];

const nonAdminRoles = [
  MAKER, CHECKER, ADMIN, READ_ONLY,
];

const allRoles = [
  ...nonAdminRoles,
  ...adminRoles,
];

describe('userHasSufficientRole', () => {
  describe('when there are no allowed roles', () => {
    const allowedNonAdminRoles = [];

    it('returns false if the user has no roles', () => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [] }
      });

      expect(allowed).toBe(false);
    });

    it.each(nonAdminRoles)('returns false if the user has the %s role and not the ukef_operations role', (userRole) => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [userRole] }
      });

      expect(allowed).toBe(false);
    });

    it('returns true if the user has the ukef_operations role only', () => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [UKEF_OPERATIONS] }
      });

      expect(allowed).toBe(true);
    });

    it.each(nonAdminRoles)('returns true if the user has the ukef_operations role and the %s role in either order', (userRole) => {
      const allowedWithOperationsFirst = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [UKEF_OPERATIONS, userRole] }
      });
      const allowedWithOperationsSecond = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [userRole, UKEF_OPERATIONS] }
      });

      expect(allowedWithOperationsFirst).toBe(true);
      expect(allowedWithOperationsSecond).toBe(true);
    });
  });

  describe.each(allRoles)('when the only allowed non-admin role is %s', (allowedRole) => {
    const allowedNonAdminRoles = [allowedRole];

    it('returns false if the user has no roles', () => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [] }
      });

      expect(allowed).toBe(false);
    });

    const nonMatchingNonAdminRoles = nonAdminRoles.filter((role) => role !== allowedRole);
    it.each(nonMatchingNonAdminRoles)('returns false if the user has the %s role and not the ukef_operations role', (userRole) => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [userRole] }
      });

      expect(allowed).toBe(false);
    });

    it('returns true if the user has the ukef_operations role only', () => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [UKEF_OPERATIONS] }
      });

      expect(allowed).toBe(true);
    });

    it(`returns true if the user has the ${allowedRole} role only`, () => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [allowedRole] }
      });

      expect(allowed).toBe(true);
    });

    it.each(nonMatchingNonAdminRoles)(`returns true if the user has the ${allowedRole} role and the %s role in either order`, (userRole) => {
      const allowedWithAllowedRoleFirst = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [allowedRole, userRole] }
      });
      const allowedWithAllowedRoleSecond = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [userRole, allowedRole] }
      });

      expect(allowedWithAllowedRoleFirst).toBe(true);
      expect(allowedWithAllowedRoleSecond).toBe(true);
    });
  });

  describe('when there are multiple allowed non-admin roles', () => {
    const allowedNonAdminRoles = [MAKER, READ_ONLY];
    const notAllowedRole = CHECKER;

    it('returns false if the user has no roles', () => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [] }
      });

      expect(allowed).toBe(false);
    });

    it('returns false if the user has none of the allowed roles and does not have the ukef_operations role', () => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [notAllowedRole] }
      });

      expect(allowed).toBe(false);
    });

    it('returns true if the user has none of the allowed roles and has the ukef_operations role', () => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [UKEF_OPERATIONS] }
      });

      expect(allowed).toBe(true);
    });

    it('returns true if the user has one of the allowed roles', () => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [allowedNonAdminRoles[0]] }
      });

      expect(allowed).toBe(true);
    });

    it('returns true if the user has multiple of the allowed roles', () => {
      const allowed = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [allowedNonAdminRoles[0], allowedNonAdminRoles[1]] }
      });

      expect(allowed).toBe(true);
    });

    it('returns true if the user has an allowed role and another role in either order', () => {
      const allowedWithAllowedRoleFirst = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [allowedNonAdminRoles[1], notAllowedRole] }
      });
      const allowedWithAllowedRoleSecond = userHasSufficientRole({
        allowedNonAdminRoles,
        user: { roles: [notAllowedRole, allowedNonAdminRoles[1]] }
      });

      expect(allowedWithAllowedRoleFirst).toBe(true);
      expect(allowedWithAllowedRoleSecond).toBe(true);
    });
  });
});
