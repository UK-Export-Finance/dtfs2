import { generateTotalFeesAccruedError } from './generate-total-fees-accrued-error';
import { FILE_UPLOAD } from '../../../constants/file-upload';

describe('generateTotalFeesAccruedError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is missing', () => {
    const nullTotalFeesAccrued = {
      value: null,
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Total fees accrued for the period must have an entry',
      column: 'A',
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const totalFeesAccruedError = generateTotalFeesAccruedError(nullTotalFeesAccrued, testExporterName);

    expect(totalFeesAccruedError).toEqual(expectedError);
  });

  it('returns an error when the value is not a number', () => {
    const invalidTotalFeesAccrued = {
      value: 'abc',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Total fees accrued for the period must be a number with a maximum of two decimal places',
      column: 'A',
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const totalFeesAccruedError = generateTotalFeesAccruedError(invalidTotalFeesAccrued, testExporterName);

    expect(totalFeesAccruedError).toEqual(expectedError);
  });

  it('returns an error when the value has more than 2 decimal places', () => {
    const invalidTotalFeesAccrued = {
      value: '0.123',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Total fees accrued for the period must be a number with a maximum of two decimal places',
      column: 'A',
      row: 1,
      value: '0.123',
      exporter: testExporterName,
    };

    const totalFeesAccruedError = generateTotalFeesAccruedError(invalidTotalFeesAccrued, testExporterName);

    expect(totalFeesAccruedError).toEqual(expectedError);
  });

  it('returns an error when the value is too long', () => {
    const invalidTotalFeesAccrued = {
      value: '1473812445951826593.52',
      column: 'A',
      row: 1,
    };
    const expectedError = {
      errorMessage: `Total fees accrued for the period must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 'A',
      row: 1,
      value: '1473812445951826593.52',
      exporter: testExporterName,
    };

    const totalFeesAccruedError = generateTotalFeesAccruedError(invalidTotalFeesAccrued, testExporterName);

    expect(totalFeesAccruedError).toEqual(expectedError);
  });

  it('returns null if the value is a valid total fees accrued', () => {
    const validTotalFeesAccrued = {
      value: '1000000',
      column: 'A',
      row: 1,
    };

    const totalFeesAccruedError = generateTotalFeesAccruedError(validTotalFeesAccrued, testExporterName);

    expect(totalFeesAccruedError).toEqual(null);
  });
});
