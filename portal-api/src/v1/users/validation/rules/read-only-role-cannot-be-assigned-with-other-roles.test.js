const readOnlyRoleCannotBeAssignedWithOtherRoles = require('./read-only-role-cannot-be-assigned-with-other-roles');
const { READ_ONLY, ALL_ROLES } = require('../../../roles/roles');

describe('readOnlyRoleCannotBeAssignedWithOtherRoles', () => {
  const user = {};
  const nonReadOnlyRoles = ALL_ROLES.filter((role) => role !== READ_ONLY);
  const allPairsOfNonReadOnlyRoles = nonReadOnlyRoles.flatMap(
    (leftRole) => nonReadOnlyRoles.map(
      (rightRole) => ({ leftRole, rightRole })
    )
  );

  it('returns no errors if the change is undefined', () => {
    const change = undefined;
    const errors = readOnlyRoleCannotBeAssignedWithOtherRoles(user, change);
    expect(errors).toStrictEqual([]);
  });

  it('returns no errors if the change does not have a roles field', () => {
    const change = {};
    const errors = readOnlyRoleCannotBeAssignedWithOtherRoles(user, change);
    expect(errors).toStrictEqual([]);
  });

  it('returns no errors if the change has an empty array of roles', () => {
    const change = {
      roles: []
    };
    const errors = readOnlyRoleCannotBeAssignedWithOtherRoles(user, change);
    expect(errors).toStrictEqual([]);
  });

  it.each(ALL_ROLES)('returns no errors if the change has the %s role assigned only', (role) => {
    const change = {
      roles: [role],
    };
    const errors = readOnlyRoleCannotBeAssignedWithOtherRoles(user, change);
    expect(errors).toStrictEqual([]);
  });

  it.each(allPairsOfNonReadOnlyRoles)('returns no errors if the change has the $leftRole and $rightRole roles assigned', ({ leftRole, rightRole }) => {
    const change = {
      roles: [leftRole, rightRole],
    };
    const errors = readOnlyRoleCannotBeAssignedWithOtherRoles(user, change);
    expect(errors).toStrictEqual([]);
  });

  // TODO DTFS2-6647: what about duplicate roles?
  it.each(nonReadOnlyRoles)('returns a role error if the change has the read-only role assigned with the %s role', (role) => {
    const change = {
      roles: [READ_ONLY, role],
    };
    const errors = readOnlyRoleCannotBeAssignedWithOtherRoles(user, change);
    expect(errors).toStrictEqual([{
      roles: {
        text: 'Users cannot have multiple roles if they have the read-only role.'
      }
    }]);
  });

  it('returns no errors if the change has the read-only role assigned twice and no other roles', () => {
    const change = {
      roles: [READ_ONLY, READ_ONLY],
    };
    const errors = readOnlyRoleCannotBeAssignedWithOtherRoles(user, change);
    expect(errors).toStrictEqual([]);
  });
});
