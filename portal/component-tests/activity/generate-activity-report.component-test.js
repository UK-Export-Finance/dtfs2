const pageRenderer = require('../pageRenderer');

const page = 'activity/generate-activity-report.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render a back link', () => {
    wrapper.expectElement('[data-cy="back-link"]').toExist();
  });

  it('should render the search bar', () => {
    wrapper.expectElement('[data-cy="users-search-bar"]').toExist();
  });

  it('should render the find user button', () => {
    wrapper.expectText('[data-cy="find-users-button"]').toRead('Find user');
  });
});
