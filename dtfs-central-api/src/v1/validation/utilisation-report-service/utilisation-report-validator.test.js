import { ObjectId } from 'mongodb';
import { validateMonth, validateYear, validateFileInfo, validateReportUser } from './utilisation-report-validator';

describe('utilisation-report-validator', () => {
  describe('validateMonth', () => {
    const defaultPropertyName = 'Month';

    it('returns null when a correct month is provided', () => {
      const validationError = validateMonth(1);

      expect(validationError).toEqual(null);
    });

    it('returns an error when no month is provided', () => {
      const validationError = validateMonth(undefined);

      expect(validationError).toEqual(`${defaultPropertyName} is required`);
    });

    it('returns an error when an incorrect month is provided', () => {
      const validationError = validateMonth(14);

      expect(validationError).toEqual(`${defaultPropertyName} must be between 1 and 12`);
    });

    it('returns an error with the specific property name when an incorrect month is provided', () => {
      const propertyName = 'date.month';
      const validationError = validateMonth(14, propertyName);

      expect(validationError).toEqual(`${propertyName} must be between 1 and 12`);
    });
  });

  describe('validateYear', () => {
    const defaultPropertyName = 'Year';

    it('returns null when a correct year is provided', () => {
      const validationError = validateYear(2023);

      expect(validationError).toEqual(null);
    });

    it('returns an error when no year is provided', () => {
      const validationError = validateYear(undefined);

      expect(validationError).toEqual(`${defaultPropertyName} is required`);
    });

    it('returns an error when an incorrect year is provided', () => {
      const validationError = validateYear(1990);

      expect(validationError).toEqual(`${defaultPropertyName} must be between 2020 and 2100`);
    });

    it('returns an error with the specific property name when an incorrect year is provided', () => {
      const propertyName = 'date.year';
      const validationError = validateMonth(14, propertyName);

      expect(validationError).toEqual(`${propertyName} must be between 1 and 12`);
    });
  });

  describe('validateFileInfo', () => {
    it('returns an empty array when correct file info is provided', async () => {
      const validationErrors = validateFileInfo({
        folder: 'test_bank',
        filename: '2021_January_test_bank_utilisation_report.csv',
        fullPath: 'test_bank/2021_January_test_bank_utilisation_report.csv',
        url: 'test.url.csv',
        mimetype: 'text/csv',
      });

      expect(validationErrors).toEqual([]);
    });

    it('returns an error when no file info is provided', async () => {
      const validationErrors = validateFileInfo(undefined);

      expect(validationErrors).toEqual(['File info is required']);
    });

    it('returns an error if the file info properties are not strings', async () => {
      const validationErrors = validateFileInfo({
        folder: 14,
        filename: {},
        fullPath: true,
        url: {},
        mimetype: 1,
      });

      expect(validationErrors.length).toBe(5);
      expect(validationErrors).toContain('Folder name from file info must be a string');
      expect(validationErrors).toContain('Filename from file info must be a string');
      expect(validationErrors).toContain('Full path from file info must be a string');
      expect(validationErrors).toContain('Url from file info must be a string');
      expect(validationErrors).toContain('Mimetype from file info must be a string');
    });

    it('returns an error if a file info property is not provided', async () => {
      const validationErrors = validateFileInfo({});

      expect(validationErrors.length).toBe(5);
      expect(validationErrors).toContain('Folder name from file info is required');
      expect(validationErrors).toContain('Filename from file info is required');
      expect(validationErrors).toContain('Full path from file info is required');
      expect(validationErrors).toContain('Url from file info is required');
      expect(validationErrors).toContain('Mimetype from file info is required');
    });
  });

  describe('validateReportUser', () => {
    it.each`
      condition                                            | user                 | errorMessage
      ${'the user is null'}                                | ${null}              | ${'User is not an object'}
      ${'the user is undefined'}                           | ${undefined}         | ${'User is not an object'}
      ${'the user is a string'}                            | ${''}                | ${'User is not an object'}
      ${'the user is an empty object'}                     | ${{}}                | ${"User object does not contain '_id' property"}
      ${"the 'user._id' property is not a string"}         | ${{ _id: 1 }}        | ${"User '_id' is not a valid MongoDB ID: '1'"}
      ${"the 'user._id' property is not a valid mongo id"} | ${{ _id: 'abc123' }} | ${"User '_id' is not a valid MongoDB ID: 'abc123'"}
    `('returns an error array of length 1 when $condition', ({ user, errorMessage }) => {
      // Act
      const errors = validateReportUser(user);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual(errorMessage);
    });

    it('returns an empty array when the user object is valid', () => {
      // Arrange
      const user = {
        _id: new ObjectId().toString(),
      };

      // Act
      const errors = validateReportUser(user);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });
});
