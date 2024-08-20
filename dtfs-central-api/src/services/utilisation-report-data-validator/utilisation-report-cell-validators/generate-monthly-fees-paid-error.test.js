const { generateMonthlyFeesPaidError } = require('./generate-monthly-fees-paid-error');
const { FILE_UPLOAD } = require('../../../constants/file-upload');

describe('generateMonthlyFeesPaidError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is missing', async () => {
    const nullMonthlyFeesPaid = {
      value: null,
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Fees paid to UKEF for the period must have an entry',
      column: 1,
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const monthlyFeesPaidError = generateMonthlyFeesPaidError(nullMonthlyFeesPaid, testExporterName);

    expect(monthlyFeesPaidError).toEqual(expectedError);
  });

  it('returns an error when the value is not a number', async () => {
    const invalidMonthlyFeesPaid = {
      value: 'abc',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Fees paid to UKEF for the period must be a number with a maximum of two decimal places',
      column: 1,
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const monthlyFeesPaidError = generateMonthlyFeesPaidError(invalidMonthlyFeesPaid, testExporterName);

    expect(monthlyFeesPaidError).toEqual(expectedError);
  });

  it('returns an error when the value has more than 2 decimal places', async () => {
    const invalidMonthlyFeesPaid = {
      value: '0.123',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Fees paid to UKEF for the period must be a number with a maximum of two decimal places',
      column: 1,
      row: 1,
      value: '0.123',
      exporter: testExporterName,
    };

    const monthlyFeesPaidError = generateMonthlyFeesPaidError(invalidMonthlyFeesPaid, testExporterName);

    expect(monthlyFeesPaidError).toEqual(expectedError);
  });

  it('returns an error when the value is too long', async () => {
    const invalidMonthlyFeesPaid = {
      value: '1473812445951826593.52',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: `Fees paid to UKEF for the period must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 1,
      row: 1,
      value: '1473812445951826593.52',
      exporter: testExporterName,
    };

    const monthlyFeesPaidError = generateMonthlyFeesPaidError(invalidMonthlyFeesPaid, testExporterName);

    expect(monthlyFeesPaidError).toEqual(expectedError);
  });

  it('returns null if the value is a valid monthly fees paid', async () => {
    const validMonthlyFeesPaid = {
      value: '1000000',
      column: 1,
      row: 1,
    };

    const monthlyFeesPaidError = generateMonthlyFeesPaidError(validMonthlyFeesPaid, testExporterName);

    expect(monthlyFeesPaidError).toEqual(null);
  });
});
