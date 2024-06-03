const selectAtLeastOneRole = require('./select-at-least-one-role');

describe('selectAtLeastOneRole', () => {
  const selectAtLeastOneRoleError = [
    {
      roles: {
        order: '3',
        text: 'At least one role is required',
      },
    },
  ];

  const testCases = [{ description: 'when no roles are provided', change: { roles: [] } }];

  describe.each(testCases)('$description', ({ change }) => {
    it('should return an error if no roles are selected', () => {
      const errors = selectAtLeastOneRole(undefined, change);
      expect(errors).toStrictEqual(selectAtLeastOneRoleError);
    });

    it('should not return an error if at least one role is selected', () => {
      const selectedRoles = { roles: ['admin'] };
      const errors = selectAtLeastOneRole(undefined, selectedRoles);
      expect(errors).toStrictEqual([]);
    });
  });
});
