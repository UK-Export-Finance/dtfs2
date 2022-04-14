const pageRenderer = require('../../../component-tests/pageRenderer');

const page = '../templates/case/facility/facility.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    facility: {},
    facilityTfm: {},
    user: {
      timezone: 'Europe/London',
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render tabs', () => {
    wrapper.expectText('[data-cy="facility-details-tab-details"]').toRead('Details');
    wrapper.expectText('[data-cy="facility-details-tab-premium-schedule"]').toRead('Premium schedule');
    wrapper.expectText('[data-cy="facility-details-tab-amendments"]').toRead('Amendments');
  });

  it('should render overview section', () => {
    wrapper.expectElement('[data-cy="facility-overview"]').toExist();
  });

  it('should render premium schedule section', () => {
    wrapper.expectElement('[data-cy="premium-schedule"]').toExist();
  });
});
