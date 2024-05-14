import { addYears } from 'date-fns';
import { validateSearchInput } from './search-input-validator';

describe('controllers/utilisation-reports/find-reports-by-year/search-input-validator', () => {
  const BANK_ID_ONE = '1';
  const BANK_ID_TWO = '2';
  const BANK_ID_THREE = '3';
  const BANK_IDS: string[] = [BANK_ID_ONE, BANK_ID_TWO, BANK_ID_THREE];

  describe('search-input-validator', () => {
    it('returns bank and year errors if no bank id or year provided', () => {
      // Arrange
      const expectedBankError = 'Select a bank';
      const expectedYearError = 'Enter a valid year';
      const expectedErrorSummary = [
        { text: expectedBankError, href: '#bank' },
        { text: expectedYearError, href: '#year' },
      ];

      // Act
      const { errorSummary, bankError, yearError } = validateSearchInput({
        bankIdQuery: undefined,
        yearQuery: undefined,
        validBankIds: BANK_IDS,
      });

      // Assert
      expect(errorSummary).toEqual(expectedErrorSummary);
      expect(bankError).toEqual(expectedBankError);
      expect(yearError).toEqual(expectedYearError);
    });

    it('returns empty errors if valid year and bank id provided', () => {
      // Arrange

      // Act
      const { errorSummary, bankError, yearError } = validateSearchInput({
        bankIdQuery: BANK_ID_ONE,
        yearQuery: '2024',
        validBankIds: BANK_IDS,
      });

      // Assert
      expect(errorSummary).toEqual([]);
      expect(bankError).toEqual(undefined);
      expect(yearError).toEqual(undefined);
    });

    it('returns bank error if year param provided but no bank param provided', () => {
      // Arrange
      const year = '2024';
      const expectedBankError = 'Select a bank';
      const expectedErrorSummary = [{ text: expectedBankError, href: '#bank' }];

      // Act
      const { errorSummary, bankError, yearError } = validateSearchInput({
        bankIdQuery: undefined,
        yearQuery: year,
        validBankIds: BANK_IDS,
      });

      // Assert
      expect(errorSummary).toEqual(expectedErrorSummary);
      expect(bankError).toEqual(expectedBankError);
      expect(yearError).toEqual(undefined);
    });

    it('returns bank error if bank param provided but no year param provided', () => {
      // Arrange
      const expectedYearError = 'Enter a valid year';
      const expectedErrorSummary = [{ text: expectedYearError, href: '#year' }];

      // Act
      const { errorSummary, bankError, yearError } = validateSearchInput({
        bankIdQuery: BANK_ID_ONE,
        yearQuery: undefined,
        validBankIds: BANK_IDS,
      });

      // Assert
      expect(errorSummary).toEqual(expectedErrorSummary);
      expect(bankError).toEqual(undefined);
      expect(yearError).toEqual(expectedYearError);
    });

    it('returns year error if year param is not a four digit integer', () => {
      // Arrange
      const year = '20';
      const expectedYearError = 'Enter a valid year';
      const expectedErrorSummary = [{ text: expectedYearError, href: '#year' }];

      // Act
      const { errorSummary, bankError, yearError } = validateSearchInput({
        bankIdQuery: BANK_ID_ONE,
        yearQuery: year,
        validBankIds: BANK_IDS,
      });

      // Assert
      expect(errorSummary).toEqual(expectedErrorSummary);
      expect(bankError).toEqual(undefined);
      expect(yearError).toEqual(expectedYearError);
    });

    it('returns year error if year param is before 2024', () => {
      // Arrange
      const year = '2023';
      const expectedYearError = 'Enter a year that is between 2024 and the current year';
      const expectedErrorSummary = [{ text: expectedYearError, href: '#year' }];

      // Act
      const { errorSummary, bankError, yearError } = validateSearchInput({
        bankIdQuery: BANK_ID_ONE,
        yearQuery: year,
        validBankIds: BANK_IDS,
      });

      // Assert
      expect(errorSummary).toEqual(expectedErrorSummary);
      expect(bankError).toEqual(undefined);
      expect(yearError).toEqual(expectedYearError);
    });

    it('returns year error if year param is after current year', () => {
      // Arrange
      const now = new Date();
      const dateInNextYear = addYears(now, 1);
      const yearOneYearInFuture = dateInNextYear.getFullYear().toString();
      const expectedYearError = 'Enter a year that is between 2024 and the current year';
      const expectedErrorSummary = [{ text: expectedYearError, href: '#year' }];

      // Act
      const { errorSummary, bankError, yearError } = validateSearchInput({
        bankIdQuery: BANK_ID_ONE,
        yearQuery: yearOneYearInFuture,
        validBankIds: BANK_IDS,
      });

      // Assert
      expect(errorSummary).toEqual(expectedErrorSummary);
      expect(bankError).toEqual(undefined);
      expect(yearError).toEqual(expectedYearError);
    });

    it('returns bank error if bank param is invalid', () => {
      // Arrange
      const year = '2024';
      const expectedBankError = 'Select a bank';
      const expectedErrorSummary = [{ text: expectedBankError, href: '#bank' }];

      // Act
      const { errorSummary, bankError, yearError } = validateSearchInput({
        bankIdQuery: 'invalidBankId',
        yearQuery: year,
        validBankIds: BANK_IDS,
      });

      // Assert
      expect(errorSummary).toEqual(expectedErrorSummary);
      expect(bankError).toEqual(expectedBankError);
      expect(yearError).toEqual(undefined);
    });
  });
});
