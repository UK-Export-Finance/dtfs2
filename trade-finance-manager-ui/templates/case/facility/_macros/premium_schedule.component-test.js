const pageRenderer = require('../../../../component-tests/componentRenderer');

const page = '../templates/case/facility/_macros/premium_schedule.njk';

const render = pageRenderer(page);


describe(page, () => {
  let wrapper;
  const params = {
    facility: {
      _id: '12345678',
      ukefFacilityID: '0040004833',
      facilityType: 'Performance Bond',
      facilityStage: 'Commitment',
      facilityProduct: {
        name: 'Bond Support Scheme',
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
      feeType: 'At maturity',
      feeFrequency: '',
      dayCountBasis: '365',
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

  describe('premium schedule section', () => {
    it('should render fee (premium) type', () => {
      wrapper.expectText('[data-cy="facility-premium-type"]').toRead(params.facility.feeType);
    });

    it('should render fee frequency', () => {
      wrapper.expectText('[data-cy="facility-premium-frequency"]').toRead(params.facility.feeFrequency);
    });

    it('should render day count basis', () => {
      wrapper.expectText('[data-cy="facility-premium-daycountbasis"]').toRead(params.facility.dayCountBasis);
    });
  });
});
