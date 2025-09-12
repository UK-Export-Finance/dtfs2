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

  const inputs = ['', ' ', [], {}];

  describe('role validation', () => {
    test.each(inputs)('should return an error when role is an %s', (input) => {
      const errors = selectAtLeastOneRole(undefined, input);
      expect(errors).toStrictEqual(selectAtLeastOneRoleError);
    });
  });

  describe('when a role is provided', () => {
    it('should not return an error', () => {
      const selectedRoles = { roles: ['admin'] };
      const errors = selectAtLeastOneRole(undefined, selectedRoles);
      expect(errors).toStrictEqual([]);
    });
  });
});
