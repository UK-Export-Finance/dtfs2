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
    roleName: 'Maker',
    roleDataAttribute: 'maker',
    roleValue: 'maker',
  }, {
    roleName: 'Checker',
    roleDataAttribute: 'checker',
    roleValue: 'checker',
  }, {
    roleName: 'Admin',
    roleDataAttribute: 'admin',
    roleValue: 'admin',
  }, {
    roleName: 'Read-only',
    roleDataAttribute: 'read-only',
    roleValue: 'read-only',
  }];

  let wrapper;

  // TODO DTFS2-6647: add test for role error message displaying
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
