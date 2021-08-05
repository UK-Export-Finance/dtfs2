const moment = require('moment');
const getGuaranteeDates = require('./get-guarantee-dates');

const submissionDate = '2021-04-24';

const issuedFacility = {
  hasBeenIssued: true,
  coverStartDate: new Date(submissionDate).valueOf(),
  coverEndDate: moment().set({
    date: Number('21'),
    month: Number('05') - 1, // months are zero indexed
    year: Number('2024'),
  }),
};

const unissuedFacility = {
  hasBeenIssued: false,
  ukefGuaranteeInMonths: 24,
};

const dealSubmissionDate = new Date(submissionDate).valueOf();

describe('get-guarantee-dates', () => {
  describe('issued facility', () => {
    it('should return the correct commencement dates', () => {
      const {
        guaranteeCommencementDate,
        guaranteeExpiryDate,
        effectiveDate,
      } = getGuaranteeDates(issuedFacility, dealSubmissionDate);

      expect(guaranteeCommencementDate).toEqual('2021-04-24');
      expect(guaranteeExpiryDate).toEqual('2024-05-21');
      expect(effectiveDate).toEqual(submissionDate);
    });
  });

  describe('unissued facility', () => {
    it('should return the correct commencement dates from deal submission date', () => {
      const {
        guaranteeCommencementDate,
        guaranteeExpiryDate,
        effectiveDate,
      } = getGuaranteeDates(unissuedFacility, dealSubmissionDate);

      expect(guaranteeCommencementDate).toEqual('2021-07-24');
      expect(guaranteeExpiryDate).toEqual('2023-07-24');
      expect(effectiveDate).toEqual(submissionDate);
    });
  });
});
