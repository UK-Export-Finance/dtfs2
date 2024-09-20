import validateRows from '.';
import addMatchingRowErrors from '../../helpers/generate-errors-for-mismatched-facility-values';

const currencyValue = 'EUR';
const facilityUtilisationValue = '34538e.54';

const baseCurrencyErrorMessage = 'The currency does not match the other records for this facility. Enter the correct currency.';
const baseCurrencyField = 'base currency';
const facilityUtilisationErrorMessage = 'The utilisation does not match the other records for this facility. Enter the correct utilisation.';
const facilityUtilisationField = 'facility utilisation';
const exporterName = 'test exporter';

const generateCSVData = (currency: string, utilisation: string) => {
  return [
    {
      'ukef facility id': { value: '20001371', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: currencyValue, column: 'D', row: 1 },
      'facility utilisation': { value: facilityUtilisationValue, column: 'F', row: 1 },
    },
    {
      'ukef facility id': { value: '20001371', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: currency, column: 'D', row: 2 },
      'facility utilisation': { value: utilisation, column: 'F', row: 2 },
    },
    {
      'ukef facility id': { value: '20001372', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: 'GBP', column: 'D', row: 3 },
      'facility utilisation': { value: facilityUtilisationValue, column: 'F', row: 3 },
    },
  ];
};

describe('validateRows', () => {
  describe('when the base currency and facility utilisation does not match for a facility', () => {
    const csvData = generateCSVData('GBP', '45');

    it('should return the result of "addMatchingRowErrors" for "base currency" and "facility utilisation"', () => {
      const currencyErrors = addMatchingRowErrors(csvData, [], csvData[0], baseCurrencyField, baseCurrencyErrorMessage, exporterName);
      const utilisationErrors = addMatchingRowErrors(
        csvData,
        currencyErrors,
        csvData[0],
        facilityUtilisationField,
        facilityUtilisationErrorMessage,
        exporterName,
      );

      const expectedErrors = [...currencyErrors, ...utilisationErrors];

      const errors = validateRows(csvData);

      expect(errors).toEqual(expectedErrors);
    });
  });

  describe('when the base currency does not match for a facility', () => {
    const csvData = generateCSVData('GBP', facilityUtilisationValue);

    it('should return the result of "addMatchingRowErrors" for "base currency"', () => {
      const expectedErrors = addMatchingRowErrors(csvData, [], csvData[0], baseCurrencyField, baseCurrencyErrorMessage, exporterName);

      const errors = validateRows(csvData);

      expect(errors).toEqual(expectedErrors);
    });
  });

  describe('when the facility utilisation does not match for a facility', () => {
    const csvData = generateCSVData(currencyValue, '45');

    it('should return the result of "addMatchingRowErrors" for "facility utilisation"', () => {
      const expectedErrors = addMatchingRowErrors(csvData, [], csvData[0], facilityUtilisationField, facilityUtilisationErrorMessage, exporterName);

      const errors = validateRows(csvData);

      expect(errors).toEqual(expectedErrors);
    });
  });

  describe('when both values match', () => {
    const csvData = generateCSVData(currencyValue, facilityUtilisationValue);

    it('should return an empty array', () => {
      const errors = validateRows(csvData);

      expect(errors).toEqual([]);
    });
  });
});
