const { generateTotalFeesAccruedError } = require('./generate-total-fees-accrued-error');
const { FILE_UPLOAD } = require('../../../constants/file-upload');

describe('generateTotalFeesAccruedError', () => {
  const testExporterName = 'test-exporter';
  it('returns an error when the value is missing', async () => {
    const nullTotalFeesAccrued = {
      value: null,
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Total fees accrued for the period must have an entry',
      column: 1,
      row: 1,
      value: null,
      exporter: testExporterName,
    };

    const totalFeesAccruedError = generateTotalFeesAccruedError(nullTotalFeesAccrued, testExporterName);

    expect(totalFeesAccruedError).toEqual(expectedError);
  });

  it('returns an error when the value is not a number', async () => {
    const invalidTotalFeesAccrued = {
      value: 'abc',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Total fees accrued for the period must be a number with a maximum of two decimal places',
      column: 1,
      row: 1,
      value: 'abc',
      exporter: testExporterName,
    };

    const totalFeesAccruedError = generateTotalFeesAccruedError(invalidTotalFeesAccrued, testExporterName);

    expect(totalFeesAccruedError).toEqual(expectedError);
  });

  it('returns an error when the value has more than 2 decimal places', async () => {
    const invalidTotalFeesAccrued = {
      value: '0.123',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: 'Total fees accrued for the period must be a number with a maximum of two decimal places',
      column: 1,
      row: 1,
      value: '0.123',
      exporter: testExporterName,
    };

    const totalFeesAccruedError = generateTotalFeesAccruedError(invalidTotalFeesAccrued, testExporterName);

    expect(totalFeesAccruedError).toEqual(expectedError);
  });

  it('returns an error when the value is too long', async () => {
    const invalidTotalFeesAccrued = {
      value: '1473812445951826593.52',
      column: 1,
      row: 1,
    };
    const expectedError = {
      errorMessage: `Total fees accrued for the period must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: 1,
      row: 1,
      value: '1473812445951826593.52',
      exporter: testExporterName,
    };

    const totalFeesAccruedError = generateTotalFeesAccruedError(invalidTotalFeesAccrued, testExporterName);

    expect(totalFeesAccruedError).toEqual(expectedError);
  });

  it('returns null if the value is a valid total fees accrued', async () => {
    const validTotalFeesAccrued = {
      value: '1000000',
      column: 1,
      row: 1,
    };

    const totalFeesAccruedError = generateTotalFeesAccruedError(validTotalFeesAccrued, testExporterName);

    expect(totalFeesAccruedError).toEqual(null);
  });
});
