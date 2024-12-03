const { pageRenderer } = require('../../pageRenderer');

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

  it('should render Cookies heading Contact Us', () => {
    wrapper.expectText('[data-cy="contact-us-footer"]').toRead('Contact us');
  });

  it('should render Cookies link under Contact Us', () => {
    wrapper.expectText('[data-cy="cookies-link"]').toRead('Cookies');
  });
  it('should render Accessibility Statement link under Contact Us', () => {
    wrapper.expectText('[data-cy="accessibility-statement-link"]').toRead('Accessibility statement');
  });
});
