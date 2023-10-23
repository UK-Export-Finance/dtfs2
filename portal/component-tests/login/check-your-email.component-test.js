const pageRenderer = require('../pageRenderer');

const page = 'login/check-your-email.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render link to request a new sign in link', () => {
    wrapper.expectText('[data-cy="request-new-sign-in-link"]').toRead('Request a new sign in link');
  });
});
