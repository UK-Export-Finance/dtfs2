const pageRenderer = require('../../../../component-tests/componentRenderer');
const formatAsCurrencyFilter = require('../../../../server/nunjucks-configuration/formatAsCurrency');

const page = '../templates/case/facility/_macros/premium_schedule.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    user: {
      timezone: 'Europe/London',
    },
  };

  const mockBssFacilityParams = {
    ...params,
    facility: {
      _id: '12345678',
      ukefFacilityId: '0040004833',
      type: 'Performance Bond',
      facilityStage: 'Commitment',
      hasBeenIssued: true,
      facilityProduct: {
        name: 'Bond Support Scheme',
      },
      coverEndDate: '1 Feb 2021',
      coveredPercentage: '10%',
      facilityValueExportCurrency: 'GBP 12,345.00',
      value: 'GBP 12,345.00',
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
    },
  };

  beforeEach(() => {
    wrapper = render(mockBssFacilityParams);
  });

  describe('premium schedule', () => {
    describe('fee (premium) type', () => {
      it('should render', () => {
        wrapper.expectText('[data-cy="facility-premium-type"]').toRead(mockBssFacilityParams.facility.feeType);
      });

      describe('when there is no feeType', () => {
        it('should render dash', () => {
          wrapper = render({});
          wrapper.expectText('[data-cy="facility-premium-type"]').toRead('-');
        });
      });
    });

    describe('`how often` feeFrequency/premiumFrequency', () => {
      it('should render', () => {
        wrapper.expectText('[data-cy="facility-premium-frequency"]').toRead(mockBssFacilityParams.facility.feeFrequency);
      });

      describe('when there is no feeFrequency, but premiumFrequency', () => {
        it('should render', () => {
          const premiumFrequencyParams = {
            ...params,
            facility: {
              ...mockBssFacilityParams.facility,
              feeFrequency: null,
              premiumFrequency: 'test',
            },
          };

          wrapper = render(premiumFrequencyParams);
          wrapper.expectText('[data-cy="facility-premium-frequency"]').toRead(premiumFrequencyParams.facility.premiumFrequency);
        });
      });

      describe('when there is no frequency', () => {
        it('should render dash', () => {
          wrapper = render({});
          wrapper.expectText('[data-cy="facility-premium-frequency"]').toRead('-');
        });
      });
    });

    describe('day count basis', () => {
      it('should render', () => {
        wrapper.expectText('[data-cy="facility-premium-day-count-basis"]').toRead(mockBssFacilityParams.facility.dayCountBasis);
      });

      describe('when there is no dayCountBasis', () => {
        it('should render dash', () => {
          wrapper = render({});
          wrapper.expectText('[data-cy="facility-premium-day-count-basis"]').toRead('-');
        });
      });
    });

    describe('premium schedule - BSS facility', () => {
      describe('total to be paid', () => {
        it('should render as facilityTfm.premiumTotals', () => {
          const expected = formatAsCurrencyFilter(mockBssFacilityParams.facilityTfm.premiumTotals);

          wrapper.expectText('[data-cy="total-to-be-paid-to-ukef"]').toRead(expected);
        });

        describe('when there is no facilityTfm.premiumTotals', () => {
          it('should render dash', () => {
            wrapper = render({});
            wrapper.expectText('[data-cy="total-to-be-paid-to-ukef"]').toRead('-');
          });
        });
      });

      describe('premium schedule table', () => {
        it('should render', () => {
          wrapper.expectElement('[data-cy="facility-premium-schedule-table"]').toExist();
        });

        it('should render correct number of premium schedule rows', () => {
          wrapper.expectElement('[data-cy="schedule_item"]').toHaveCount(mockBssFacilityParams.facilityTfm.premiumSchedule.length);
        });

        it('should format the premium schedule date correctly', () => {
          const firstPremiumSchedule = mockBssFacilityParams.facilityTfm.premiumSchedule[0];
          wrapper.expectText(`[data-cy="facility-${firstPremiumSchedule.id}-dueDate"]`).toRead('06 May 2021');
        });
      });
    });

    describe('premium schedule - GEF facility', () => {
      const mockGefFacilityParams = {
        ...params,
        facility: {
          type: 'Cash facility',
        },
        facilityTfm: {
          feeRecord: 12345678,
        },
      };

      beforeEach(() => {
        wrapper = render(mockGefFacilityParams);
      });

      describe('total to be paid', () => {
        it('should render as facilityTfm.feeRecord', () => {
          const expected = formatAsCurrencyFilter(mockGefFacilityParams.facilityTfm.feeRecord);

          wrapper.expectText('[data-cy="total-to-be-paid-to-ukef"]').toRead(expected);
        });

        describe('when there is no facilityTfm.feeRecord', () => {
          it('should render dash', () => {
            wrapper = render({});
            wrapper.expectText('[data-cy="total-to-be-paid-to-ukef"]').toRead('-');
          });
        });
      });

      it('should NOT render premium schedule table', () => {
        wrapper.expectElement('[data-cy="facility-premium-schedule-table"]').notToExist();
      });
    });
  });
});
