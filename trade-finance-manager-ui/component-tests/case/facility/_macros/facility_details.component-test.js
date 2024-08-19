const { componentRenderer } = require('../../../componentRenderer');

const component = '../templates/case/facility/_macros/facility_details.njk';
const { localiseTimestamp } = require('../../../../server/nunjucks-configuration/filter-localiseTimestamp');

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  const baseFacility = {
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
    dates: {
      inclusionNoticeReceived: '1606900616651',
      bankIssueNoticeReceived: '1606900616652',
      coverStartDate: '1606900616653',
      coverEndDate: '20 Oct 2020',
      tenor: '3 months',
    },
  };

  const facilityWithFacilityEndDate = {
    ...baseFacility,
    dates: { ...baseFacility.dates, isUsingFacilityEndDate: true, facilityEndDate: null },
  };
  const facilityWithFacilityEndDateSpecified = {
    ...baseFacility,
    dates: { ...baseFacility.dates, isUsingFacilityEndDate: true, facilityEndDate: '2024-07-18T00:00:00.000+00:00' },
  };
  const facilityWithBankReviewDate = {
    ...baseFacility,
    dates: { ...baseFacility.dates, isUsingFacilityEndDate: false, bankReviewDate: null },
  };
  const facilityWithBankReviewDateSpecified = {
    ...baseFacility,
    dates: { ...baseFacility.dates, isUsingFacilityEndDate: false, bankReviewDate: '2024-07-20T00:00:00.000+00:00' },
  };

  const params = {
    facility: baseFacility,
    facilityTfm: {
      exchangeRate: '0.89',
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

    it('should render type', () => {
      wrapper.expectText('[data-cy="facility-type"]').toRead(params.facility.type);
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

    it('should NOT render facility provided section', () => {
      wrapper.expectElement('[data-cy="facility-provided"]').notToExist();
    });

    describe('when dealType is GEF', () => {
      const gefParams = {
        ...params,
        deal: { dealType: 'GEF' },
        facility: {
          ...params.facility,
          providedOn: ['Revolving or renewing basis', 'Committed basis'],
          providedOnOther: 'Mock other details',
        },
      };

      beforeEach(() => {
        wrapper = render(gefParams);
      });

      it('should render facility provided heading', () => {
        wrapper.expectText('[data-cy="facility-provided-heading"]').toRead('Facility provided on');
      });

      it('should render multiple providedOn basis', () => {
        const basis1 = gefParams.facility.providedOn[0];
        wrapper.expectText(`[data-cy="facility-provided-${basis1}"]`).toRead(basis1);

        const basis2 = gefParams.facility.providedOn[1];
        wrapper.expectText(`[data-cy="facility-provided-${basis2}"]`).toRead(basis2);

        wrapper.expectText('[data-cy="facility-provided-other-details"]').toRead(`Other - ${gefParams.facility.providedOnOther}`);
      });
    });
  });

  describe('value and exposure section', () => {
    it('should render facilityValueExportCurrency', () => {
      wrapper.expectText('[data-cy="facility-value-export-currency"]').toRead(params.facility.facilityValueExportCurrency);
    });

    it('Should render exchangeRate (Non-GBP facilities only)', () => {
      wrapper.expectText('[data-cy="facility-exchange-rate"]').toRead(params.facilityTfm.exchangeRate);
    });

    it('should render value', () => {
      wrapper.expectText('[data-cy="facility-value-gbp"]').toRead(params.facility.value);
    });

    it('should render UKEF cover / coveredPercentage', () => {
      wrapper.expectText('[data-cy="facility-ukef-cover"]').toRead(params.facility.coveredPercentage);
    });

    it('should render maximum ukefExposure', () => {
      const expectedTimestamp = localiseTimestamp(params.facilityTfm.ukefExposure.timestamp, 'd MMMM yyyy', params.user.timezone);
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
      const expected = localiseTimestamp(params.facility.dates.inclusionNoticeReceived, 'd MMMM yyyy', params.user.timezone);
      wrapper.expectText('[data-cy="facility-inclusion-notice-received"]').toRead(expected);
    });

    it('should render bankIssueNoticeReceived', () => {
      const expected = localiseTimestamp(params.facility.dates.bankIssueNoticeReceived, 'd MMMM yyyy', params.user.timezone);
      wrapper.expectText('[data-cy="facility-bank-issue-notice-received"]').toRead(expected);
    });

    it('should render coverStartDate', () => {
      const expected = localiseTimestamp(params.facility.dates.coverStartDate, 'd MMMM yyyy', params.user.timezone);
      wrapper.expectText('[data-cy="facility-cover-start-date"]').toRead(expected);
    });

    it('should render coverEndDate', () => {
      wrapper.expectText('[data-cy="facility-cover-end-date"]').toRead(params.facility.dates.coverEndDate);
    });

    it('should render tenor', () => {
      wrapper.expectText('[data-cy="facility-tenor"]').toRead(params.facility.dates.tenor);
    });

    describe('when shouldDisplayFacilityEndDate is false', () => {
      beforeEach(() => {
        wrapper = render({ ...params, facility: facilityWithFacilityEndDate, shouldDisplayFacilityEndDate: false });
      });
      it('should not render isUsingFacilityEndDate', () => {
        wrapper.expectText('[data-cy="facility-is-using-facility-end-date"]').notToExist();
      });

      it('should not render facilityEndDate', () => {
        wrapper.expectText('[data-cy="facility-facility-end-date"]').notToExist();
      });

      it('should not render bankReviewDate', () => {
        wrapper.expectText('[data-cy="facility-bank-review-date"]').notToExist();
      });
    });

    describe('when shouldDisplayFacilityEndDate is true', () => {
      describe('when the facility has no end date information', () => {
        beforeEach(() => {
          wrapper = render({ ...params, shouldDisplayFacilityEndDate: true });
        });
        it('should render a dash for isUsingFacilityEndDate', () => {
          wrapper.expectText('[data-cy="facility-is-using-facility-end-date"]').toRead('-');
        });

        it('should render a dash for facilityEndDate', () => {
          wrapper.expectText('[data-cy="facility-facility-end-date"]').toRead('-');
        });

        it('should not render bankReviewDate', () => {
          wrapper.expectText('[data-cy="facility-bank-review-date"]').notToExist();
        });
      });

      describe('when the facility has an end date which is not specified', () => {
        beforeEach(() => {
          wrapper = render({ ...params, facility: facilityWithFacilityEndDate, shouldDisplayFacilityEndDate: true });
        });
        it('should render isUsingFacilityEndDate', () => {
          wrapper.expectText('[data-cy="facility-is-using-facility-end-date"]').toRead('Yes');
        });

        it('should render facilityEndDate', () => {
          wrapper.expectText('[data-cy="facility-facility-end-date"]').toRead('-');
        });

        it('should not render bankReviewDate', () => {
          wrapper.expectText('[data-cy="facility-bank-review-date"]').notToExist();
        });
      });

      describe('when the facility has an end date which is specified', () => {
        beforeEach(() => {
          wrapper = render({ ...params, facility: facilityWithFacilityEndDateSpecified, shouldDisplayFacilityEndDate: true });
        });
        it('should render isUsingFacilityEndDate', () => {
          wrapper.expectText('[data-cy="facility-is-using-facility-end-date"]').toRead('Yes');
        });

        it('should render facilityEndDate', () => {
          wrapper.expectText('[data-cy="facility-facility-end-date"]').toRead('18 July 2024');
        });

        it('should not render bankReviewDate', () => {
          wrapper.expectText('[data-cy="facility-bank-review-date"]').notToExist();
        });
      });

      describe('when the facility does not have an end date and bank review date is not specified', () => {
        beforeEach(() => {
          wrapper = render({ ...params, facility: facilityWithBankReviewDate, shouldDisplayFacilityEndDate: true });
        });
        it('should render isUsingFacilityEndDate', () => {
          wrapper.expectText('[data-cy="facility-is-using-facility-end-date"]').toRead('No');
        });

        it('should not render facilityEndDate', () => {
          wrapper.expectText('[data-cy="facility-facility-end-date"]').notToExist();
        });

        it('should render bankReviewDate', () => {
          wrapper.expectText('[data-cy="facility-bank-review-date"]').toRead('-');
        });
      });

      describe('when the facility does not have an end date and bank review date specified', () => {
        beforeEach(() => {
          wrapper = render({ ...params, facility: facilityWithBankReviewDateSpecified, shouldDisplayFacilityEndDate: true });
        });
        it('should render isUsingFacilityEndDate', () => {
          wrapper.expectText('[data-cy="facility-is-using-facility-end-date"]').toRead('No');
        });

        it('should not render facilityEndDate', () => {
          wrapper.expectText('[data-cy="facility-facility-end-date"]').notToExist();
        });

        it('should render bankReviewDate', () => {
          wrapper.expectText('[data-cy="facility-bank-review-date"]').toRead('20 July 2024');
        });
      });
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
