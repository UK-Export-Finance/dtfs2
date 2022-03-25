const componentRenderer = require('../../component-tests/componentRenderer');

const component = '../templates/_macros/header.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  describe('with params.user', () => {
    const params = {
      user: {
        firstName: 'Test',
        lastName: 'Testing',
      },
    };

    it('should render user\'s first and last name', () => {
      wrapper = render(params);

      const expected = `${params.user.firstName} ${params.user.lastName}Profile`;

      wrapper.expectText('[data-cy="header-user-link"]').toRead(expected);
    });

    it('should render sign out link', () => {
      wrapper = render(params);

      wrapper.expectText('[data-cy="header-sign-out-link"]').toRead('Sign out');
    });
  });

  describe('without params.creditRating', () => {
    it('should NOT render user\'s first and last name', () => {
      wrapper = render({});

      wrapper.expectElement('[data-cy="header-user-link"]').notToExist();
    });

    it('should NOT render sign out link', () => {
      wrapper = render({});

      wrapper.expectElement('[data-cy="header-sign-out-link"]').notToExist();
    });
  });
});
