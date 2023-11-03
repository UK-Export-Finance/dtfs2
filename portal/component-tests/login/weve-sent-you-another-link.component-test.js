const pageRenderer = require('../pageRenderer');

const page = 'login/weve-sent-you-another-link.njk';
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
