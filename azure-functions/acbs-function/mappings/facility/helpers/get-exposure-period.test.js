const { cloneDeep } = require('lodash');
const getExposurePeriod = require('./get-exposure-period');
const { PRODUCT } = require('../../../constants');

describe('getExposurePeriod', () => {
  describe('with amendment and fmr', () => {
    const dealType = PRODUCT.TYPE.BSS_EWCS;
    /**
     * mock data taken from ACBSIssueFacilityResponseBody
     * in external-api\src\utils\swagger-definitions\acbs.ts
     */
    const mockFmr = {
      // submittedToACBS: '2021-09-30T09:42:31+01:00',
      // receivedFromACBS: '2021-20-02T08:32:31+01:00',
      // dealIdentifier: '0020900040',
      // facilityIdentifier: '0020900041',
      // dealBorrowerIdentifier: '00000000',
      // maximumLiability: 501927.75,
      // productTypeId: '250',
      // capitalConversionFactorCode: '8',
      // productTypeName: 'Bond',
      // currency: 'CAD',
      // guaranteeCommencementDate: '2018-10-11',
      // guaranteeExpiryDate: '2019-01-23',
      // nextQuarterEndDate: '2018-12-31',
      // delegationType: 'A',
      // interestOrFeeRate: 2.35,
      // facilityStageCode: '06',
      // exposurePeriod: '18',
      // creditRatingCode: '14',
      // premiumFrequencyCode: '2',
      // riskCountryCode: 'GBR',
      // riskStatusCode: '03',
      // effectiveDate: '2018-10-11',
      // forecastPercentage: 75,
      issueDate: '2018-10-11',
      // agentBankIdentifier: '00000000',
      // obligorPartyIdentifier: '00510701',
      // obligorIndustryClassification: '0116',
      // probabilityOfDefault: 14,
    };

    it('calculates difference correctly when date of months are different', () => {
      const mockFacility = {
        facilitySnapshot: {},
        amendment: {
          coverEndDate: '2019-01-12', // Verify this type
        },
      };
      const result = getExposurePeriod(mockFacility, dealType, mockFmr);

      expect(result).toEqual('4');
    });

    it('calculates difference correctly when date of months are equal', () => {
      const mockFacility = {
        facilitySnapshot: {},
        amendment: {
          coverEndDate: '2019-01-11', // Verify this type
        },
      };
      const result = getExposurePeriod(mockFacility, dealType, mockFmr);

      expect(result).toEqual('3');
    });
  });
  describe('with no amendment or fmr', () => {
    const fmr = null;

    describe('with dealType GEF', () => {
      const dealType = PRODUCT.TYPE.GEF;
      const defaultFacility = {
        facilitySnapshot: {
          monthsOfCover: 11, // wht this
        },
        tfm: {
          exposurePeriodInMonths: 12, // what this
        },
      };
      it('returns the exposurePeriod value when issued', () => {
        const mockFacility = cloneDeep(defaultFacility);
        mockFacility.facilitySnapshot.hasBeenIssued = true;

        const result = getExposurePeriod(mockFacility, dealType, fmr);

        expect(result).toEqual('12');
      });
      it('returns the correct value when it has not been issued', () => {
        const mockFacility = cloneDeep(defaultFacility);
        mockFacility.facilitySnapshot.hasBeenIssued = false;

        const result = getExposurePeriod(mockFacility, dealType, fmr);

        expect(result).toEqual('11');
      });
    });

    describe('with dealType BSS/EWCS', () => {
      const dealType = PRODUCT.TYPE.BSS_EWCS;
      const defaultFacility = {
        facilitySnapshot: {
          hasBeenIssued: 'sdf', // what this
          'coverEndDate-year': '2024',
          'coverEndDate-month': '12',
          'coverEndDate-day': '22',
          'requestedCoverStartDate-day': '22',
          'requestedCoverStartDate-month': '02',
          'requestedCoverStartDate-year': '2024',
          ukefGuaranteeInMonths: 999,
        },
        tfm: {},
      };
      describe('if the exposure period has been calculated', () => {
        it('returns the value', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.tfm.exposurePeriodInMonths = 12;

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('12');
        });
      });
      describe('if the exposure period has not been calculated', () => {
        it('should return the correct value if `requestedCoverStartDate` epoch and `coverEndDate` values are valid and on same day of month', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot.requestedCoverStartDate = '1708604949494';

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('10');
        });

        it('should return the correct value if the and `coverEndDate` values are given, valid and on different day of month', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot['coverEndDate-day'] = '23';
          mockFacility.facilitySnapshot.requestedCoverStartDate = '1708604949494';

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('11');
        });

        it('should return correct value if the `requestedCoverStartDate` epoch is not given but start and end day, month & year values are valid and on the same day of month', () => {
          const mockFacility = cloneDeep(defaultFacility);

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('10');
        });

        // existing behaviour - a bit odd. this should not happen because it would be the string NaN (I think)
        it('should return correct value if the `requestedCoverStartDate` epoch is NaN but start and end day, month & year values are valid and on the same day of month', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot.requestedCoverStartDate = NaN;

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('10');
        });

        it('should return correct value if the `requestedCoverStartDate` epoch is not given but start and end day, month & year values are valid and on the different days of months', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot['coverEndDate-day'] = '23';

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('11');
        });

        it('should return the ukefGuaranteeInMonths if the `requestedCoverStartDate` epoch is given but invalid', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot.requestedCoverStartDate = '##';

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('999');
        });

        it('should return the ukefGuaranteeInMonths if the `requestedCoverStartDate` epoch is not given and the start date day is invalid', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot['requestedCoverStartDate-day'] = '##';

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('999');
        });

        it('should return the ukefGuaranteeInMonths if the `requestedCoverStartDate` epoch is not given and the start date month is invalid', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot['requestedCoverStartDate-month'] = '##';

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('999');
        });

        it('should return the ukefGuaranteeInMonths if the `requestedCoverStartDate` epoch is not given and the start date year is invalid', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot['requestedCoverStartDate-year'] = '##';

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('999');
        });

        it('should return the ukefGuaranteeInMonths if the `coverEndDate-day` is invalid', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot['coverEndDate-day'] = '##';

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('999');
        });

        it('should return the ukefGuaranteeInMonths if the `coverEndDate-month` is invalid', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot['coverEndDate-month'] = '##';

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('999');
        });

        it('should return the ukefGuaranteeInMonths if the `coverEndDate-year` is invalid', () => {
          const mockFacility = cloneDeep(defaultFacility);
          mockFacility.facilitySnapshot['coverEndDate-year'] = '##';

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('999');
        });
        // Not sure how this occurs other than being on the same date? feels unnecessary to have these lines in the function anyway
        // it('should return the ukefGuaranteeInMonths when the durationMonths and monthOffset are falsey');
      });
    });
  });
});
