const { pageRenderer } = require('../../pageRenderer');

const page = '../templates/case/facility/facility.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    facility: {},
    facilityTfm: {},
    user: {
      timezone: 'Europe/London',
      teams: [],
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render facility type', () => {
    wrapper.expectText('[data-cy="facility-type"]').toRead('-');
  });

  it('should render tabs', () => {
    wrapper.expectText('[data-cy="facility-details-tab-details"]').toRead('Details');
    wrapper.expectText('[data-cy="facility-details-tab-premium-schedule"]').toRead('Premium schedule');
    wrapper.expectText('[data-cy="facility-details-tab-amendments"]').toRead('Amendments');
  });

  it('should render overview section', () => {
    wrapper.expectElement('[data-cy="facility-overview"]').toExist();
    wrapper.expectElement('[data-cy="facility-product"]').toExist();
    wrapper.expectElement('[data-cy="facility-type"]').toExist();
    wrapper.expectElement('[data-cy="facility-stage"]').toExist();
    wrapper.expectElement('[data-cy="bank-facility-reference"]').toExist();
  });

  it('should render value and export', () => {
    wrapper.expectElement('[data-cy="facility-value-export-currency"]').toExist();
    wrapper.expectElement('[data-cy="facility-exchange-rate"]').toExist();
    wrapper.expectElement('[data-cy="facility-value-gbp"]').toExist();
    wrapper.expectElement('[data-cy="facility-ukef-cover"]').toExist();
    wrapper.expectElement('[data-cy="facility-maximum-ukef-exposure"]').toExist();
  });

  it('should render dates', () => {
    wrapper.expectElement('[data-cy="facility-inclusion-notice-received"]').toExist();
    wrapper.expectElement('[data-cy="facility-bank-issue-notice-received"]').toExist();
    wrapper.expectElement('[data-cy="facility-cover-start-date"]').toExist();
    wrapper.expectElement('[data-cy="facility-cover-end-date"]').toExist();
    wrapper.expectElement('[data-cy="facility-tenor"]').toExist();
  });

  it('should render pricing and risk', () => {
    wrapper.expectElement('[data-cy="facility-banks-interest-margin"]').toExist();
    wrapper.expectElement('[data-cy="facility-guarantee-fee-payable-to-ukef"]').toExist();
  });

  it('should render footer', () => {
    wrapper.expectElement('[data-cy="contact-us-footer"]').toExist();
    wrapper.expectElement('[data-cy="cookies-link"]').toExist();
    wrapper.expectElement('[data-cy="accessibility-statement-link"]').toExist();
  });

  it('should render premium schedule section', () => {
    wrapper.expectElement('[data-cy="premium-schedule"]').toExist();
    wrapper.expectElement('[data-cy="facility-premium-type"]').toExist();
    wrapper.expectElement('[data-cy="facility-premium-frequency"]').toExist();
    wrapper.expectElement('[data-cy="facility-premium-day-count-basis"]').toExist();
  });

  it('should render dates and amounts', () => {
    wrapper.expectElement('[data-cy="facility-premium-schedule"]').toExist();
    wrapper.expectElement('[data-cy="total-to-be-paid-to-ukef"]').toExist();
    wrapper.expectElement('[data-cy="facilities-table-heading-facility-id"]').toExist();
    wrapper.expectElement('[data-cy="facilities-table-heading-cover-end-date"]').toExist();
    wrapper.expectElement('[data-cy="facilities-table-heading-value-gbp"]').toExist();
  });

  describe('when showFacilityEndDate is false', () => {
    it('should not render facility end date', () => {
      wrapper = render({ ...params, showFacilityEndDate: false });
      wrapper.expectElement('[data-cy="is-using-facility-end-date"]').notToExist();
      wrapper.expectElement('[data-cy="facility-end-date"]').notToExist();
      wrapper.expectElement('[data-cy="bank-review-date"]').notToExist();
    });
  });

  describe('when showFacilityEndDate is true', () => {
    it('should display the correct default facility end date fields', () => {
      wrapper = render({ ...params, showFacilityEndDate: true });
      wrapper.expectElement('[data-cy="is-using-facility-end-date"]').toExist();
      wrapper.expectElement('[data-cy="facility-end-date"]').toExist();
      wrapper.expectElement('[data-cy="bank-review-date"]').notToExist();
    });

    describe('when isUsingFacilityEndDate is false', () => {
      it('should display the correct default bank review date fields', () => {
        wrapper = render({ ...params, showFacilityEndDate: true, facility: { dates: { isUsingFacilityEndDate: false } } });
        wrapper.expectElement('[data-cy="is-using-facility-end-date"]').toExist();
        wrapper.expectElement('[data-cy="facility-end-date"]').notToExist();
        wrapper.expectElement('[data-cy="bank-review-date"]').toExist();
      });
    });
  });

  describe('when show');
});
