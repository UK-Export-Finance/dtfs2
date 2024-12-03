const { set } = require('date-fns');
const getGuaranteeDates = require('./get-guarantee-dates');

const submissionDate = '2023-01-01';
const dealSubmissionDate = new Date(submissionDate).valueOf();
const issuedFacility = {
  hasBeenIssued: true,
  coverStartDate: new Date(submissionDate).valueOf(),
  coverEndDate: set(new Date(), {
    date: Number('01'),
    month: Number('01') - 1, // months are zero indexed
    year: Number('2024'),
  }),
};
const unissuedFacility = {
  hasBeenIssued: false,
  ukefGuaranteeInMonths: 12,
};

describe('Get guarantee dates in TFM', () => {
  describe('When a facility is un-issued / commitment / 06', () => {
    it('Should return the correct dates', () => {
      const { guaranteeCommencementDate, guaranteeExpiryDate, effectiveDate } = getGuaranteeDates(unissuedFacility, dealSubmissionDate);

      // Deal submission date
      expect(guaranteeCommencementDate).toEqual(submissionDate);
      // GCD + Tenor
      expect(guaranteeExpiryDate).toEqual('2024-01-01');
      // Deal submission date
      expect(effectiveDate).toEqual(submissionDate);
    });
  });

  describe('when a facility is Issued / 07', () => {
    it('Should return the correct dates', () => {
      const { guaranteeCommencementDate, guaranteeExpiryDate, effectiveDate } = getGuaranteeDates(issuedFacility, dealSubmissionDate);

      // Cover start date
      expect(guaranteeCommencementDate).toEqual('2023-01-01');
      // Cover end date
      expect(guaranteeExpiryDate).toEqual('2024-01-01');
      // Deal submission date
      expect(effectiveDate).toEqual(submissionDate);
    });
  });
});
