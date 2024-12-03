const { sub, format } = require('date-fns');
const checkConversionRate = require('./conversion-rate-date');

describe('validation - conversion rate date', () => {
  const deal = {
    details: {
      submissionDate: null,
    },
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

    const nowDate = new Date();
    const MAX_DAYS_FROM_NOW = sub(nowDate, { days: 29 });

    const errorsLess = checkConversionRate(facilityLess, errorList, deal);

    expect(errorsLess.conversionRateDate.text).toEqual(
      `Conversion rate date must be between ${format(MAX_DAYS_FROM_NOW, 'do MMMM yyyy')} and ${format(nowDate, 'do MMMM yyyy')}`,
    );
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
