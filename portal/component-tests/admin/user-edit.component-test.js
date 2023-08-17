const pageRenderer = require('../pageRenderer');

const page = 'admin/user-edit.njk';
const render = pageRenderer(page);

describe(page, () => {
  const adminUser = {
    timezone: 'Europe/London',
    roles: ['admin'],
  };
  const newUser = { roles: [] };

  const banks = [{
    id: 1,
    name: 'Bank 1',
  }, {
    id: 2,
    name: 'Bank 2',
  }, {
    id: 3,
    name: 'Bank 3',
  }];

  const roles = [{
    roleName: 'Maker/Checker',
    roleDataAttribute: 'maker/checker',
    roleValue: 'maker/checker',
  }, {
    roleName: 'Checker',
    roleDataAttribute: 'checker',
    roleValue: 'checker',
  }, {
    roleName: 'Maker',
    roleDataAttribute: 'maker',
    roleValue: 'maker',
  }, {
    roleName: 'UKEF Operations',
    roleDataAttribute: 'ukef_operations',
    roleValue: 'ukef_operations',
  }, {
    roleName: 'EFM',
    roleDataAttribute: 'efm',
    roleValue: 'EFM',
  }, {
    roleName: 'Read Only',
    roleDataAttribute: 'read-only',
    roleValue: 'read-only',
  }];

  let wrapper;

  describe('the role selectors', () => {
    const roleAttributeSelector = (role) => `[data-cy="role-${role}"]`;

    describe.each(roles)('for $roleName', ({ roleDataAttribute, roleValue }) => {
      it('should render', () => {
        wrapper = render({
          banks,
          user: adminUser,
          displayedUser: newUser,
        });
        wrapper.expectInput(roleAttributeSelector(roleDataAttribute)).toHaveValue(roleValue);
      });

      it('should not be checked if the displayed user does not have the role', () => {
        wrapper = render({
          banks,
          user: adminUser,
          displayedUser: {
            ...newUser,
            roles: [],
          },
        });
        wrapper.expectInput(roleAttributeSelector(roleDataAttribute)).toNotBeChecked();
      });

      it('should be checked if the displayed user does have the role', () => {
        wrapper = render({
          banks,
          user: adminUser,
          displayedUser: {
            ...newUser,
            roles: [roleValue],
          },
        });
        wrapper.expectInput(roleAttributeSelector(roleDataAttribute)).toBeChecked();
      });
    });
  });
});
