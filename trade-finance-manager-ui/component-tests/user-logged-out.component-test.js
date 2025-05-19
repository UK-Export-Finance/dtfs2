const { pageRenderer } = require('./pageRenderer');

const page = '../templates/user-logged-out.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render user logged out heading', () => {
    wrapper.expectText('[data-cy="you-have-been-logged-out-heading"]').toRead('You have been logged out');
  });

  it('should render user logged out message', () => {
    wrapper.expectText('[data-cy="you-have-been-logged-out-message"]').toRead('You have been logged out of Trade Finance Manager.');
  });
});
