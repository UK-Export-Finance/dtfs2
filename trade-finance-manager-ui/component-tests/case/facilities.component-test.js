const { pageRenderer } = require('../pageRenderer');

const page = '../templates/facilities/facilities.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    heading: 'All facilities',
    facilities: [],
    user: {},
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
    wrapper.expectElement('[data-cy="facilities-heading"]').toExist();
    wrapper.expectText('[data-cy="facilities-heading"]').toRead(params.heading);
  });

  it('should render search form component', () => {
    wrapper.expectElement('[data-cy="ukef-search-form"]').toExist();
  });

  it('should render facilities table component', () => {
    wrapper.expectElement('[data-cy="facilities-table"]').toExist();
  });

  it('should render pagination component', () => {
    wrapper.expectElement('[data-cy="pagination"]').toExist();
  });
});
