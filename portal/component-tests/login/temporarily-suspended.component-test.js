const pageRenderer = require('../pageRenderer');

const page = 'login/temporarily-suspended.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render link to request a new sign in link', () => {
    wrapper.expectText('[data-cy="dtfs-email-link"]').toRead('DigitalService.TradeFinance@ukexportfinance.gov.uk');
  });
});
