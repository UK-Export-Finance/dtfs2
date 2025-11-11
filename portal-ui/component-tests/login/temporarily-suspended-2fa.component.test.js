const pageRenderer = require('../pageRenderer');
const { withContactUsEmailAddressTests } = require('../test-helpers/with-contact-us-email-address.component-tests');

const page = 'login/temporarily-suspended-2fa.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  beforeEach(() => {
    wrapper = render();
  });

  withContactUsEmailAddressTests({ page });

  it('should render the heading', () => {
    wrapper.expectText('[data-cy="2fa-account-suspended-heading"]').toRead('This account has been temporarily suspended');
  });

  it('should render the suspended message', () => {
    wrapper
      .expectText('[data-cy="2fa-account-suspended-message"]')
      .toRead('This can happen if there are too many failed attempts to login or sign in link requests.');
  });
});
