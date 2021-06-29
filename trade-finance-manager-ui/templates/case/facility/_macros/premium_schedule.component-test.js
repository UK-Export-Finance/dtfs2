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
      feeType: 'In arrears',
      feeFrequency: 'Monthly',
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
    premiumSchedule: [
      {
        id: 2035,
        calculationDate: '2021-05-06',
        income: 99.2,
        incomePerDay: 3.2,
        exposure: 64000,
        period: 1,
        daysInPeriod: 31,
        effectiveFrom: '2021-05-06T00:00:00',
        effectiveTo: '2023-05-05T00:00:00',
        created: '2021-05-06T11:08:41',
        updated: '2021-05-06T11:08:41',
        isAtive: 'Y',
        __typename: 'PremiumScheduleData',
        formattedIncome: '99.20',
      },
      {
        id: 2036,
        calculationDate: '2021-06-06',
        income: 96,
        incomePerDay: 3.2,
        exposure: 64000,
        period: 2,
        daysInPeriod: 30,
        effectiveFrom: '2021-05-06T00:00:00',
        effectiveTo: '2023-05-05T00:00:00',
        created: '2021-05-06T11:08:41',
        updated: '2021-05-06T11:08:41',
        isAtive: 'Y',
        __typename: 'PremiumScheduleData',
        formattedIncome: '96.00',
      },
      {
        id: 2037,
        calculationDate: '2021-07-06',
        income: 99.2,
        incomePerDay: 3.2,
        exposure: 64000,
        period: 3,
        daysInPeriod: 31,
        effectiveFrom: '2021-05-06T00:00:00',
        effectiveTo: '2023-05-05T00:00:00',
        created: '2021-05-06T11:08:41',
        updated: '2021-05-06T11:08:41',
        isAtive: 'Y',
        __typename: 'PremiumScheduleData',
        formattedIncome: '99.20',
      },
    ],
    premiumTotals: '294.40',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('premium schedule table', () => {
    it('should render fee (premium) type', () => {
      wrapper.expectText('[data-cy="facility-premium-type"]').toRead(params.facility.feeType);
    });

    it('should render fee frequency', () => {
      wrapper.expectText('[data-cy="facility-premium-frequency"]').toRead(params.facility.feeFrequency);
    });

    it('should render day count basis', () => {
      wrapper.expectText('[data-cy="facility-premium-daycountbasis"]').toRead(params.facility.dayCountBasis);
    });

    it('should render correct number of premium schedule rows', () => {
      wrapper.expectElement('[data-cy="schedule_item"]').toHaveCount(params.premiumSchedule.length);
    });

    it('should format the premium schedule date correctly', () => {
      const firstPremiumSchedule = params.premiumSchedule[0];
      wrapper.expectText(`[data-cy="facility-${firstPremiumSchedule.id}-dueDate"]`).toRead('06 May 2021');
    });

    describe('at maturity', () => {
      beforeEach(() => {
        const atMaturityParams = {
          facility: {
            ...params.facility,
            feeType: 'At maturity',
            feeFrequency: '',
          },
        };
        wrapper = render(atMaturityParams);
      });

      it('should not render fee frequency', () => {
        wrapper.expectText('[data-cy="facility-premium-frequency"]').notToExist();
      });
    });
  });
});
