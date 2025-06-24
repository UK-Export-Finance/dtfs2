const { pageRenderer } = require('./pageRenderer');

const page = '../templates/user-logged-out.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render user logged out heading', () => {
    wrapper.expectText('[data-cy="you-have-been-logged-out-heading"]').toRead('You have been logged out of Trade Finance Manager');
  });

  it('should render the primary navigation button', () => {
    wrapper.expectElement('[data-cy="govuk-sso-login-button"]').toExist();
  });

  it('should validate primary navigation button link and text', () => {
    wrapper.expectLink('[data-cy="govuk-sso-login-button"]').toLinkTo('/', 'Return to sign in');
  });
});
