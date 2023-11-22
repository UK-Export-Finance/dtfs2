const pageRenderer = require('../pageRenderer');

const page = '../templates/login.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render Sign in button', () => {
    wrapper.expectText('[data-cy="submit-button"]').toRead('Sign in');
  });
});
