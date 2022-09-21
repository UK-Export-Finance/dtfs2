const checkConversionRate = require('../../../src/v1/validation/fields/currency-not-the-same-as-supply-contract-rules/conversion-rate-date');

describe('validation - conversion rate date', () => {
  const deal = {
    details: {
      submissionDate: null,
    }
  };

  const errorList = {};

  it('should return validation error if the conversion date year has a symbol in it', () => {
    const facility = {
      'conversionRateDate-day': '22',
      'conversionRateDate-month': '02',
      'conversionRateDate-year': '2O22',
    };

    const errors = checkConversionRate(facility, errorList, deal);

    expect(errors.conversionRateDate.text).toEqual('The year for the conversion rate must include 4 numbers');
  });

  it('should return validation error if the conversion date month has a symbol in it', () => {
    const facility = {
      'conversionRateDate-day': '22',
      'conversionRateDate-month': '02-',
      'conversionRateDate-year': '2022',
    };

    const errors = checkConversionRate(facility, errorList, deal);

    expect(errors.conversionRateDate.text).toEqual('The month for the conversion rate must include 1 or 2 numbers');
  });

  it('should return validation error if the conversion date day has a symbol in it', () => {
    const facility = {
      'conversionRateDate-day': '22-',
      'conversionRateDate-month': '02',
      'conversionRateDate-year': '2022',
    };

    const errors = checkConversionRate(facility, errorList, deal);

    expect(errors.conversionRateDate.text).toEqual('The day for the conversion rate must include 1 or 2 numbers');
  });

  it('should return validation error if the conversion date year has 3 numbers or more than 4 numbers', () => {
    const facility = {
      'conversionRateDate-day': '22',
      'conversionRateDate-month': '02',
      'conversionRateDate-year': '202',
    };

    const errors = checkConversionRate(facility, errorList, deal);

    expect(errors.conversionRateDate.text).toEqual('The year for the conversion rate must include 4 numbers');

    const facilityLess = {
      'conversionRateDate-day': '22',
      'conversionRateDate-month': '02',
      'conversionRateDate-year': '202',
    };

    const errorsLess = checkConversionRate(facilityLess, errorList, deal);

    expect(errorsLess.conversionRateDate.text).toEqual('The year for the conversion rate must include 4 numbers');
  });

  it('should return validation error if the conversion date year is 00 or 0000', () => {
    const facility = {
      'conversionRateDate-day': '22',
      'conversionRateDate-month': '02',
      'conversionRateDate-year': '00',
    };

    const errors = checkConversionRate(facility, errorList, deal);

    expect(errors.conversionRateDate.text).toEqual('The year for the conversion rate must include 4 numbers');

    const facilityLess = {
      'conversionRateDate-day': '22',
      'conversionRateDate-month': '02',
      'conversionRateDate-year': '0000',
    };

    const errorsLess = checkConversionRate(facilityLess, errorList, deal);

    expect(errorsLess.conversionRateDate.text).toEqual('Conversion rate date must be between 23rd August 2022 and 21st September 2022');
  });

  it('should return validation error if the conversion date month has more than 2 numbers', () => {
    const facility = {
      'conversionRateDate-day': '22',
      'conversionRateDate-month': '022',
      'conversionRateDate-year': '2022',
    };

    const errors = checkConversionRate(facility, errorList, deal);

    expect(errors.conversionRateDate.text).toEqual('The month for the conversion rate must include 1 or 2 numbers');
  });

  it('should return validation error if the conversion date day has more than 2 numbers', () => {
    const facility = {
      'conversionRateDate-day': '221',
      'conversionRateDate-month': '02',
      'conversionRateDate-year': '2022',
    };

    const errors = checkConversionRate(facility, errorList, deal);

    expect(errors.conversionRateDate.text).toEqual('The day for the conversion rate must include 1 or 2 numbers');
  });
});
