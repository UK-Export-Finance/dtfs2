import { generateFeesPaidForThePeriodError } from './generate-fees-paid-for-the-period-error';
import { CSV } from '../../../constants/csv';

describe('generateMonthlyFeesPaidError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is missing', () => {
    const nullMonthlyFeesPaid = {
      value: null,
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Fees paid to UKEF for the period must have an entry',
      column: 'A',
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const monthlyFeesPaidError = generateFeesPaidForThePeriodError(nullMonthlyFeesPaid, testExporterName);

    expect(monthlyFeesPaidError).toEqual(expectedError);
  });

  it('returns an error when the value is not a number', () => {
    const invalidMonthlyFeesPaid = {
      value: 'abc',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Fees paid to UKEF for the period must be a number with a maximum of two decimal places',
      column: 'A',
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const monthlyFeesPaidError = generateFeesPaidForThePeriodError(invalidMonthlyFeesPaid, testExporterName);

    expect(monthlyFeesPaidError).toEqual(expectedError);
  });

  it('returns an error when the value has more than 2 decimal places', () => {
    const invalidMonthlyFeesPaid = {
      value: '0.123',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Fees paid to UKEF for the period must be a number with a maximum of two decimal places',
      column: 'A',
      row: 1,
      value: '0.123',
      exporter: testExporterName,
    };

    const monthlyFeesPaidError = generateFeesPaidForThePeriodError(invalidMonthlyFeesPaid, testExporterName);

    expect(monthlyFeesPaidError).toEqual(expectedError);
  });

  it('returns an error when the value is too long', () => {
    const invalidMonthlyFeesPaid = {
      value: '1473812445951826593.52',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: `Fees paid to UKEF for the period must be ${CSV.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 'A',
      row: 1,
      value: '1473812445951826593.52',
      exporter: testExporterName,
    };

    const monthlyFeesPaidError = generateFeesPaidForThePeriodError(invalidMonthlyFeesPaid, testExporterName);

    expect(monthlyFeesPaidError).toEqual(expectedError);
  });

  it('returns null if the value is a valid monthly fees paid', () => {
    const validMonthlyFeesPaid = {
      value: '1000000',
      column: 'A',
      row: 1,
    };

    const monthlyFeesPaidError = generateFeesPaidForThePeriodError(validMonthlyFeesPaid, testExporterName);

    expect(monthlyFeesPaidError).toEqual(null);
  });
});
