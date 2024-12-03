const { pageRenderer } = require('../pageRenderer');

const page = '../templates/deals/deals.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    heading: 'All deals',
    deals: [],
    user: {
      teams: [],
    },
    pages: {
      totalPages: 2,
      currentPage: 0,
      totalItems: 40,
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render heading', () => {
    wrapper.expectElement('[data-cy="deals-heading"]').toExist();
    wrapper.expectText('[data-cy="deals-heading"]').toRead(params.heading);
  });

  it('should render search form component', () => {
    wrapper.expectElement('[data-cy="ukef-search-form"]').toExist();
  });

  it('should render deals table component', () => {
    wrapper.expectElement('[data-cy="deals-table"]').toExist();
  });

  it('should render pagination component', () => {
    wrapper.expectElement('[data-cy="pagination"]').toExist();
  });
});
