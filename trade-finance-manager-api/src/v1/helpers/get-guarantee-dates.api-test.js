const getGuaranteeDates = require('./get-guarantee-dates');

const submissionDate = '2021-04-24';

const issuedFacility = {
  hasBeenIssued: true,
  coverStartDate: new Date(submissionDate).valueOf(),
  'coverEndDate-year': '2024',
  'coverEndDate-month': '05',
  'coverEndDate-day': '21',
};

const unissuedFacility = {
  hasBeenIssued: false,
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
      expect(guaranteeExpiryDate).toEqual('2023-07-24');
      expect(effectiveDate).toEqual(submissionDate);
    });
  });
});
