const pageRenderer = require('../pageRenderer');

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
});
