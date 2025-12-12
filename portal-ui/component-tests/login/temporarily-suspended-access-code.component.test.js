const pageRenderer = require('../pageRenderer');
const { withContactUsEmailAddressTests } = require('../test-helpers/with-contact-us-email-address.component-tests');

const page = 'login/temporarily-suspended-access-code.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  beforeEach(() => {
    wrapper = render();
  });

  withContactUsEmailAddressTests({ page });

  it('should render the heading', () => {
    wrapper.expectText('[data-cy="account-temporarily-suspended-heading"]').toRead('This account has been temporarily suspended');
  });

  it('should render the suspended message', () => {
    wrapper
      .expectText('[data-cy="account-temporarily-suspended-message"]')
      .toRead('This can happen if there are too many failed attempts to login or sign in link requests.');
  });
});
