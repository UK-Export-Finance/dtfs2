const { componentRenderer } = require('../componentRenderer');

const component = '../templates/_macros/header.njk';

describe(component, () => {
  let wrapper;
  let params;
  const render = componentRenderer(component);

  describe('with params.user', () => {
    describe('when sso is enabled', () => {
      const ssoProfileUrl = 'https://myaccount.microsoft.com/';

      beforeEach(() => {
        params = getParams({ isSsoEnabled: true, ssoProfileUrl });
      });

      it('should not display the profile link', () => {
        wrapper = render(params);

        wrapper.expectElement('[data-cy="header-user-link"]').notToExist();
      });

      it('should render the user name as a link to the MS SSO profile that opens in a new tab', () => {
        wrapper = render(params);

        wrapper.expectElement('a[data-cy="header-user-name"]').toExist();
        wrapper.expectElement('span[data-cy="header-user-name"]').notToExist();
        wrapper.expectLink('[data-cy="header-user-name"]').toLinkTo(ssoProfileUrl, 'Test Testing (opens in new tab)');
        wrapper.expectElement('[data-cy="header-user-name"]').toHaveAttribute('target', '_blank');
        wrapper.expectElement('[data-cy="header-user-name"]').toHaveAttribute('rel', 'noopener noreferrer');
      });

      it('should include visually hidden text so screen reader users are informed the link opens in a new tab', () => {
        wrapper = render(params);

        wrapper.expectText('[data-cy="header-user-name"] .govuk-visually-hidden').toRead('(opens in new tab)');
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

      it('should render the user name as a span rather than a link', () => {
        wrapper = render(params);

        wrapper.expectElement('span[data-cy="header-user-name"]').toExist();
        wrapper.expectElement('a[data-cy="header-user-name"]').notToExist();
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
    ssoProfileUrl: 'https://myaccount.microsoft.com/',
  };

  return { ...defaultConfig, ...customConfig };
}
