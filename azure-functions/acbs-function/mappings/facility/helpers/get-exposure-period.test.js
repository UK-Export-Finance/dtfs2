const { cloneDeep } = require('lodash');
const getExposurePeriod = require('./get-exposure-period');
const { PRODUCT } = require('../../../constants');

describe('getExposurePeriod', () => {
  describe('with amendment and facility master record', () => {
    const dealType = PRODUCT.TYPE.BSS_EWCS;
    /**
     * mock data taken from ACBSIssueFacilityResponseBody
     * in external-api\src\utils\swagger-definitions\acbs.ts
     */
    const mockFmr = {
      issueDate: '2018-10-11',
    };

    it('calculates difference correctly when date of months are different', () => {
      const mockFacility = {
        facilitySnapshot: {},
        amendment: {
          coverEndDate: '2019-01-12',
        },
      };
      const result = getExposurePeriod(mockFacility, dealType, mockFmr);

      expect(result).toEqual('4');
    });

    it('calculates difference correctly when date of months are equal', () => {
      const mockFacility = {
        facilitySnapshot: {},
        amendment: {
          coverEndDate: '2019-01-11',
        },
      };
      const result = getExposurePeriod(mockFacility, dealType, mockFmr);

      expect(result).toEqual('3');
    });

    it('treats null coverEndDate as January 1st 1970', () => {
      const mockFacility = {
        facilitySnapshot: {},
        amendment: {
          coverEndDate: null,
        },
      };
      const result = getExposurePeriod(mockFacility, dealType, mockFmr);

      expect(result).toEqual('-584');
    });

    it('treats null issueDate as January 1st 1970', () => {
      const fmrWithNullIssueDate = {
        issueDate: null,
      };

      const mockFacility = {
        facilitySnapshot: {},
        amendment: {
          coverEndDate: '2019-01-11',
        },
      };
      const result = getExposurePeriod(mockFacility, dealType, fmrWithNullIssueDate);

      expect(result).toEqual('589');
    });

    it('treats null coverEndDate and issueDate as January 1st 1970', () => {
      const fmrWithNullIssueDate = {
        issueDate: null,
      };

      const mockFacility = {
        facilitySnapshot: {},
        amendment: {
          coverEndDate: null,
        },
      };
      const result = getExposurePeriod(mockFacility, dealType, fmrWithNullIssueDate);

      expect(result).toEqual('0');
    });
  });
  describe('with no amendment or facility master record', () => {
    const fmr = null;

    describe('with dealType GEF', () => {
      const dealType = PRODUCT.TYPE.GEF;
      const defaultFacility = {
        facilitySnapshot: {
          monthsOfCover: 11,
        },
        tfm: {
          exposurePeriodInMonths: 12,
        },
      };

      it('returns the exposurePeriod value when issued', () => {
        const mockFacility = cloneDeep(defaultFacility);
        mockFacility.facilitySnapshot.hasBeenIssued = true;

        const result = getExposurePeriod(mockFacility, dealType, fmr);

        expect(result).toEqual('12');
      });

      it('returns monthsOfCover when it has not been issued', () => {
        const mockFacility = cloneDeep(defaultFacility);
        mockFacility.facilitySnapshot.hasBeenIssued = false;

        const result = getExposurePeriod(mockFacility, dealType, fmr);

        expect(result).toEqual('11');
      });
    });

    describe('with dealType BSS/EWCS', () => {
      const dealType = PRODUCT.TYPE.BSS_EWCS;

      describe('if the exposure period has been calculated and has been issued', () => {
        it('returns the value', () => {
          const mockFacility = {
            facilitySnapshot: {
              'coverEndDate-year': '2024',
              'coverEndDate-month': '12',
              'coverEndDate-day': '22',
              'requestedCoverStartDate-day': '22',
              'requestedCoverStartDate-month': '02',
              'requestedCoverStartDate-year': '2024',
              ukefGuaranteeInMonths: '999',
            },
            tfm: {},
          };
          mockFacility.tfm.exposurePeriodInMonths = 12;
          mockFacility.facilitySnapshot.hasBeenIssued = true;

          const result = getExposurePeriod(mockFacility, dealType, fmr);

          expect(result).toEqual('12');
        });
      });

      describe('if the exposure period has not been calculated', () => {
        describe('with valid dates', () => {
          const defaultFacility = {
            facilitySnapshot: {
              'coverEndDate-year': '2024',
              'coverEndDate-month': '12',
              'coverEndDate-day': '22',
              'requestedCoverStartDate-day': '22',
              'requestedCoverStartDate-month': '02',
              'requestedCoverStartDate-year': '2024',
            },
            tfm: {},
          };

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

          it('should return correct value if the `requestedCoverStartDate` epoch is not given but start and end day, month & year values are valid and on the different days of months', () => {
            const mockFacility = cloneDeep(defaultFacility);
            mockFacility.facilitySnapshot['coverEndDate-day'] = '23';

            const result = getExposurePeriod(mockFacility, dealType, fmr);

            expect(result).toEqual('11');
          });
        });

        describe('with invalid dates & ukefGuaranteeInMonths', () => {
          const defaultFacility = {
            facilitySnapshot: {
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
        });

        describe('with invalid dates & no ukefGuaranteeInMonths', () => {
          const defaultFacility = {
            facilitySnapshot: {
              'coverEndDate-year': '2024',
              'coverEndDate-month': '12',
              'coverEndDate-day': '22',
              'requestedCoverStartDate-day': '22',
              'requestedCoverStartDate-month': '02',
              'requestedCoverStartDate-year': '2024',
            },
            tfm: {},
          };

          it('should return `0` if the `requestedCoverStartDate` epoch is given but invalid', () => {
            const mockFacility = cloneDeep(defaultFacility);
            mockFacility.facilitySnapshot.requestedCoverStartDate = '##';

            const result = getExposurePeriod(mockFacility, dealType, fmr);

            expect(result).toEqual('0');
          });

          it('should return `0` if the `requestedCoverStartDate` epoch is not given and the start date day is invalid', () => {
            const mockFacility = cloneDeep(defaultFacility);
            mockFacility.facilitySnapshot['requestedCoverStartDate-day'] = '##';

            const result = getExposurePeriod(mockFacility, dealType, fmr);

            expect(result).toEqual('0');
          });

          it('should return `0` if the `requestedCoverStartDate` epoch is not given and the start date month is invalid', () => {
            const mockFacility = cloneDeep(defaultFacility);
            mockFacility.facilitySnapshot['requestedCoverStartDate-month'] = '##';

            const result = getExposurePeriod(mockFacility, dealType, fmr);

            expect(result).toEqual('0');
          });

          it('should return `0` if the `requestedCoverStartDate` epoch is not given and the start date year is invalid', () => {
            const mockFacility = cloneDeep(defaultFacility);
            mockFacility.facilitySnapshot['requestedCoverStartDate-year'] = '##';

            const result = getExposurePeriod(mockFacility, dealType, fmr);

            expect(result).toEqual('0');
          });

          it('should return `0` if the `coverEndDate-day` is invalid', () => {
            const mockFacility = cloneDeep(defaultFacility);
            mockFacility.facilitySnapshot['coverEndDate-day'] = '##';

            const result = getExposurePeriod(mockFacility, dealType, fmr);

            expect(result).toEqual('0');
          });

          it('should return `0` if the `coverEndDate-month` is invalid', () => {
            const mockFacility = cloneDeep(defaultFacility);
            mockFacility.facilitySnapshot['coverEndDate-month'] = '##';

            const result = getExposurePeriod(mockFacility, dealType, fmr);

            expect(result).toEqual('0');
          });

          it('should return `0` if the `coverEndDate-year` is invalid', () => {
            const mockFacility = cloneDeep(defaultFacility);
            mockFacility.facilitySnapshot['coverEndDate-year'] = '##';

            const result = getExposurePeriod(mockFacility, dealType, fmr);

            expect(result).toEqual('0');
          });
        });
      });
    });
  });
});
