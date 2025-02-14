const { componentRenderer } = require('../componentRenderer');

const component = '../templates/_macros/header.njk';

describe(component, () => {
  let wrapper;
  let params;
  const render = componentRenderer(component);

  describe('with params.user', () => {
    describe('when sso is enabled', () => {
      beforeEach(() => {
        params = getParams({ isSsoEnabled: true });
      });

      it('should not display the profile link', () => {
        wrapper = render(params);

        wrapper.expectElement('[data-cy="header-user-link"]').notToExist();
      });
    });

    describe('when sso is disabled', () => {
      beforeEach(() => {
        params = getParams({ isSsoEnabled: false });
      });

      it('should display the profile link', () => {
        wrapper = render(params);

        wrapper.expectText('[data-cy="header-user-link"]').toRead('Profile');
      });
    });

    it("should render user's first and last name", () => {
      const firstName = 'First name';
      const lastName = 'Last name';

      params = getParams({
        user: {
          firstName,
          lastName,
        },
      });
      wrapper = render(params);

      const expected = `${firstName} ${lastName}`;

      wrapper.expectText('[data-cy="header-user-name"]').toRead(expected);
    });

    it('should render sign out link', () => {
      wrapper = render(params);

      wrapper.expectText('[data-cy="header-sign-out-link"]').toRead('Sign out');
    });
  });
});

function getParams(customConfig = {}) {
  const defaultConfig = {
    user: {
      firstName: 'Test',
      lastName: 'Testing',
    },
    isSsoEnabled: false,
  };

  return { ...defaultConfig, ...customConfig };
}
