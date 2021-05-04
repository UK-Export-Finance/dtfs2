const getGuaranteeDates = require('./get-guarantee-dates');
const CONSTANTS = require('../../constants');

const submissionDate = '2021-04-24';

const issuedFacility = {
  facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED,
  requestedCoverStartDate: new Date(submissionDate).valueOf(),
  'coverEndDate-year': '2024',
  'coverEndDate-month': '05',
  'coverEndDate-day': '21',
};

const unissuedFacility = {
  facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED,
  ukefGuaranteeInMonths: 24,
};

const submissionDateTimestamp = new Date(submissionDate).valueOf();

describe('get-guarantee-dates', () => {
  describe('issued facility', () => {
    it('should return the correct commencement dates', () => {
      const {
        guaranteeCommencementDate,
        guaranteeExpiryDate,
        effectiveDate,
      } = getGuaranteeDates(issuedFacility, submissionDateTimestamp);

      expect(guaranteeCommencementDate).toEqual('2021-04-24');
      expect(guaranteeExpiryDate).toEqual('2024-05-21');
      expect(effectiveDate).toEqual(submissionDate);
    });
  });

  describe('unissued facility', () => {
    it('should return the correct commencement dates', () => {
      const {
        guaranteeCommencementDate,
        guaranteeExpiryDate,
        effectiveDate,
      } = getGuaranteeDates(unissuedFacility, submissionDateTimestamp);

      expect(guaranteeCommencementDate).toEqual('2021-07-24');
      expect(guaranteeExpiryDate).toEqual('2023-07-23');
      expect(effectiveDate).toEqual(submissionDate);
    });
  });
});
