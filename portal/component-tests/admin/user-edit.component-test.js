const { dateIanaTimezoneConfig } = require('@ukef/dtfs2-common');
const pageRenderer = require('../pageRenderer');

const page = 'admin/user-edit.njk';
const render = pageRenderer(page);

describe(page, () => {
  const adminUser = {
    timezone: dateIanaTimezoneConfig.DEFAULT,
    roles: ['admin'],
  };
  const newUser = { roles: [] };

  const banks = [
    {
      id: 1,
      name: 'Bank 1',
    },
    {
      id: 2,
      name: 'Bank 2',
    },
    {
      id: 3,
      name: 'Bank 3',
    },
  ];

  const roles = [
    {
      roleName: 'Maker',
      roleDataAttribute: 'maker',
      roleValue: 'maker',
    },
    {
      roleName: 'Checker',
      roleDataAttribute: 'checker',
      roleValue: 'checker',
    },
    {
      roleName: 'Admin',
      roleDataAttribute: 'admin',
      roleValue: 'admin',
    },
    {
      roleName: 'Read-only',
      roleDataAttribute: 'read-only',
      roleValue: 'read-only',
    },
    {
      roleName: 'Payment Report Officer',
      roleDataAttribute: 'payment-report-officer',
      roleValue: 'payment-report-officer',
    },
  ];

  let wrapper;

  describe('the back button', () => {
    it('should link to /admin/users', () => {
      wrapper = render({
        banks,
        user: adminUser,
        displayedUser: newUser,
      });
      wrapper.expectLink('[data-cy="back-link"]').toLinkTo('/admin/users', 'Back');
    });
  });

  describe('the roles selector', () => {
    const roleAttributeSelector = (role) => `[data-cy="role-${role}"]`;

    describe.each(roles)('the checkbox to select $roleName', ({ roleDataAttribute, roleValue }) => {
      it(`should have value ${roleValue}`, () => {
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

    describe('error message', () => {
      const paramsToRenderWithoutError = {
        banks,
        user: adminUser,
        displayedUser: {
          ...newUser,
          roles: [],
        },
      };

      it('displays if there is a validation error for the roles', () => {
        const rolesErrorMessage = "You cannot combine 'Read-only' with any of the other roles";
        wrapper = render({
          ...paramsToRenderWithoutError,
          validationErrors: {
            errorList: {
              roles: {
                text: rolesErrorMessage,
              },
            },
          },
        });
        wrapper.expectText('[data-cy="roles-error-message"]').toRead(`Error: ${rolesErrorMessage}`);
      });

      it('does not display if there are no validation errors', () => {
        wrapper = render(paramsToRenderWithoutError);
        wrapper.expectText('[data-cy="roles-error-message"]').notToExist();
      });

      it('does not display if there are validation errors for other inputs but not for roles', () => {
        wrapper = render({
          ...paramsToRenderWithoutError,
          validationErrors: {
            errorList: {
              otherError: {
                text: 'some text',
              },
            },
          },
        });
        wrapper.expectText('[data-cy="roles-error-message"]').notToExist();
      });
    });
  });
});
