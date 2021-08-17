const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/facility/_macros/facility_details.njk';
const filterLocaliseTimestamp = require('../../../../server/nunjucks-configuration/filter-localiseTimestamp');

const render = componentRenderer(component);

const localiseTimestamp = filterLocaliseTimestamp.default;

describe(component, () => {
  let wrapper;
  const params = {
    facility: {
      _id: '12345678',
      ukefFacilityID: '0040004833',
      facilityType: 'Performance Bond',
      facilityStage: 'Commitment',
      facilityProduct: {
        displayName: 'Bond Support Scheme',
      },
      coverEndDate: '1 Feb 2021',
      coveredPercentage: '10%',
      facilityValueExportCurrency: 'GBP 12,345.00',
      facilityValue: 'GBP 12,345.00',
      ukefExposure: 'GBP 1,234.00',
      bankFacilityReference: '123456',
      guaranteeFeePayableToUkef: '10%',
      banksInterestMargin: '10%',
      firstDrawdownAmountInExportCurrency: 'GBP 1,234',
      dates: {
        inclusionNoticeReceived: '1606900616651',
        bankIssueNoticeReceived: '1606900616652',
        coverStartDate: '1606900616653',
        coverEndDate: '20 Oct 2020',
        tenor: '3 months',
      },
    },
    facilityTfm: {
      ukefExposure: {
        exposure: 'GBP 123',
        timestamp: '1606900616651',
      },
    },
    user: {
      timezone: 'Europe/London',
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('overview section', () => {
    it('should render facilityProduct', () => {
      wrapper.expectText('[data-cy="facility-product"]').toRead(params.facility.facilityProduct.name);
    });

    it('should render facilityType', () => {
      wrapper.expectText('[data-cy="facility-type"]').toRead(params.facility.facilityType);
    });

    it('should render facilityStage', () => {
      wrapper.expectText('[data-cy="facility-stage"]').toRead(params.facility.facilityStage);
    });

    it('should render firstDrawdownAmountInExportCurrency', () => {
      wrapper.expectText('[data-cy="first-drawdown-amount-in-export-currency"]').toRead(params.facility.firstDrawdownAmountInExportCurrency);
    });

    it('should render bankFacilityReference', () => {
      wrapper.expectText('[data-cy="bank-facility-reference"]').toRead(params.facility.bankFacilityReference);
    });
  });

  describe('value and exposure section', () => {
    it('should render facilityValueExportCurrency', () => {
      wrapper.expectText('[data-cy="facility-value-export-currency"]').toRead(params.facility.facilityValueExportCurrency);
    });

    it('should render facilityValue', () => {
      wrapper.expectText('[data-cy="facility-value-gbp"]').toRead(params.facility.facilityValue);
    });

    it('should render UKEF cover / coveredPercentage', () => {
      wrapper.expectText('[data-cy="facility-ukef-cover"]').toRead(params.facility.coveredPercentage);
    });

    it('should render maximum ukefExposure', () => {
      const expectedTimestamp = localiseTimestamp(params.facilityTfm.ukefExposure.timestamp, 'D MMMM YYYY', params.user.timezone);
      const expected = `${params.facilityTfm.ukefExposure.exposure} as at ${expectedTimestamp}`;
      wrapper.expectText('[data-cy="facility-maximum-ukef-exposure"]').toRead(expected);
    });

    describe('when there is no exposure and ukefExposure.timestamp', () => {
      const paramsNoExposure = {
        ...params,
        facilityTfm: {},
      };

      beforeEach(() => {
        wrapper = render(paramsNoExposure);
      });

      it('should render a dash', () => {
        wrapper.expectText('[data-cy="facility-maximum-ukef-exposure"]').toRead('-');
      });
    });
  });

  describe('`dates` section', () => {
    it('should render inclusionNoticeReceived', () => {
      const expected = localiseTimestamp(params.facility.dates.inclusionNoticeReceived, 'D MMMM YYYY', params.user.timezone);
      wrapper.expectText('[data-cy="facility-inclusion-notice-received"]').toRead(expected);
    });

    it('should render bankIssueNoticeReceived', () => {
      const expected = localiseTimestamp(params.facility.dates.bankIssueNoticeReceived, 'D MMMM YYYY', params.user.timezone);
      wrapper.expectText('[data-cy="facility-bank-issue-notice-received"]').toRead(expected);
    });

    it('should render coverStartDate', () => {
      const expected = localiseTimestamp(params.facility.dates.coverStartDate, 'D MMMM YYYY', params.user.timezone);

      wrapper.expectText('[data-cy="facility-cover-start-date"]').toRead(expected);
    });

    it('should render coverEndDate', () => {
      wrapper.expectText('[data-cy="facility-cover-end-date"]').toRead(params.facility.dates.coverEndDate);
    });

    it('should render tenor', () => {
      wrapper.expectText('[data-cy="facility-tenor"]').toRead(params.facility.dates.tenor);
    });
  });

  describe('`facility pricing and risk` section', () => {
    it('should render banksInterestMargin', () => {
      wrapper.expectText('[data-cy="facility-banks-interest-margin"]').toRead(params.facility.banksInterestMargin);
    });

    it('should render guaranteeFeePayableToUkef', () => {
      wrapper.expectText('[data-cy="facility-guarantee-fee-payable-to-ukef"]').toRead(params.facility.guaranteeFeePayableToUkef);
    });

    it('should render credit rating component', () => {
      wrapper.expectElement('[data-cy="credit-rating"]').toExist();
    });
  });
});
