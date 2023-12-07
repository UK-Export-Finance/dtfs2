const pageRenderer = require('../../pageRenderer');

const page = 'admin/activity/search-users.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render the search bar', () => {
    wrapper.expectElement('[data-cy="users-search-bar"]').toExist();
  });

  it('should render the find user button', () => {
    wrapper.expectText('[data-cy="find-users-button"]').toRead('Find user');
  });
});
