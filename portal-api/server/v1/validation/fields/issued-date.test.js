const { sub, format, add } = require('date-fns');
const validateIssuedDate = require('./issued-date');
const { getLongFormattedDate } = require('../../helpers/date');

const today = new Date();
const twoDaysAgo = sub(today, { days: 2 });
const tomorrow = add(today, { days: 1 });

const deal = {
  details: {
    submissionDate: today.valueOf(),
  },
};
const errorList = [];

describe('validateIssuedDate', () => {
  it('should return missing error if no date and no day values', () => {
    const facility = {
      issuedDate: null,
      'issuedDate-day': null,
      'issuedDate-month': null,
      'issuedDate-year': null,
    };

    const result = validateIssuedDate(facility, errorList, deal);

    expect(result.issuedDate[0].text).toEqual('Enter the Issued Date');
  });
  it('should return error if date is before dealSubmissionDate', () => {
    const facility = {
      issuedDate: twoDaysAgo.valueOf(),
      'issuedDate-day': format(twoDaysAgo, 'dd'),
      'issuedDate-month': format(twoDaysAgo, 'MM'),
      'issuedDate-year': format(twoDaysAgo, 'yyyy'),
    };

    const result = validateIssuedDate(facility, errorList, deal);

    expect(result.issuedDate[0].text).toEqual(`Issued Date must be on or after ${getLongFormattedDate(deal.details.submissionDate)}`);
  });
  it('should return error if date is in the future', () => {
    const facility = {
      issuedDate: tomorrow.valueOf(),
      'issuedDate-day': format(tomorrow, 'dd'),
      'issuedDate-month': format(tomorrow, 'MM'),
      'issuedDate-year': format(tomorrow, 'yyyy'),
    };

    const result = validateIssuedDate(facility, errorList, deal);

    expect(result.issuedDate[0].text).toEqual('Issued Date must be today or in the past');
  });
  it('should return missing error if day values exist but full date is missing', () => {
    const facility = {
      issuedDate: null,
      'issuedDate-day': format(tomorrow, 'dd'),
      'issuedDate-month': format(tomorrow, 'MM'),
      'issuedDate-year': format(tomorrow, 'yyyy'),
    };

    const result = validateIssuedDate(facility, errorList, deal);

    expect(result.issuedDate[0].text).toEqual('Enter the Issued Date');
  });
});
