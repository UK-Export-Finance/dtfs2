import { validateSearchInput } from './search-input-validator';

describe('controllers/utilisation-reports/find-reports-by-year/search-input-validator', () => {
  const bankNameOne = 'Barclays Bank';
  const bankNameTwo = 'HSBC';
  const bankNameThree = 'Newable';
  const bankNames: string[] = [bankNameOne, bankNameTwo, bankNameThree];

  describe('search-input-validator', () => {
    it("returns empty errors if no bank and year", () => {
      // Arrange

      // Act
      const {errorSummary, bankError, yearError} = validateSearchInput(undefined, undefined, bankNames);

      // Assert
      expect(errorSummary).toEqual([]);
      expect(bankError).toEqual(undefined);
      expect(yearError).toEqual(undefined);
    });

    it("returns bank error if year param but no bank param", () => {
      // Arrange
      const year = '2023';
      const expectedBankError = 'Select a bank';
      const expectedErrorSummary = [{ text: expectedBankError, href: "#bank" }]

      // Act
      const {errorSummary, bankError, yearError} = validateSearchInput(undefined, year, bankNames);

      // Assert
      expect(errorSummary).toEqual(expectedErrorSummary);
      expect(bankError).toEqual(expectedBankError);
      expect(yearError).toEqual(undefined);
    });

    it("returns bank error if bank param but no year param", () => {
      // Arrange
      const expectedYearError = 'Enter a valid year';
      const expectedErrorSummary = [{ text: expectedYearError, href: "#year" }]

      // Act
      const {errorSummary, bankError, yearError} = validateSearchInput(bankNameOne, undefined, bankNames);

      // Assert
      expect(errorSummary).toEqual(expectedErrorSummary);
      expect(bankError).toEqual(undefined);
      expect(yearError).toEqual(expectedYearError);
    });

    it("returns year error if year param is invalid", () => {
      // Arrange
      const year = '20';
      const expectedYearError = 'Enter a valid year';
      const expectedErrorSummary = [{ text: expectedYearError, href: "#year" }]

      // Act
      const {errorSummary, bankError, yearError} = validateSearchInput(bankNameOne, year, bankNames);

      // Assert
      expect(errorSummary).toEqual(expectedErrorSummary);
      expect(bankError).toEqual(undefined);
      expect(yearError).toEqual(expectedYearError);
    });
  });
});
