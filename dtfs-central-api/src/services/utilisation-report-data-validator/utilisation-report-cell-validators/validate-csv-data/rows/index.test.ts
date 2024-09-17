import validateRows from '.';

const currencyValue = 'EUR';
const facilityUtilisationValue = '34538e.54';

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
      'base currency': { value: currency, column: 'D', row: 1 },
      'facility utilisation': { value: utilisation, column: 'F', row: 1 },
    },
    {
      'ukef facility id': { value: '20001372', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: 'GBP', column: 'D', row: 1 },
      'facility utilisation': { value: facilityUtilisationValue, column: 'F', row: 1 },
    },
  ];
};

describe('validateRows', () => {
  describe('when the base currency and facility utilisation does not match for a facility', () => {
    const csvData = generateCSVData('GBP', '45');

    it('should return an errors for "base currency" and "facility utilisation"', () => {
      const expectedErrors = [
        {
          errorMessage: 'The currency does not match the other records for this facility. Enter the correct currency.',
          column: 'D',
          row: 1,
          value: csvData[1]['base currency'].value,
          exporter: 'test exporter',
        },
        {
          errorMessage: 'The utilisation does not match the other records for this facility. Enter the correct utilisation.',
          column: 'F',
          row: 1,
          value: csvData[1]['facility utilisation'].value,
          exporter: 'test exporter',
        },
      ];

      const errors = validateRows(csvData, []);

      expect(errors).toEqual(expectedErrors);
    });
  });

  describe('when the base currency does not match for a facility', () => {
    const csvData = generateCSVData('GBP', facilityUtilisationValue);

    it('should return an error for "base currency"', () => {
      const expectedErrors = [
        {
          errorMessage: 'The currency does not match the other records for this facility. Enter the correct currency.',
          column: 'D',
          row: 1,
          value: csvData[1]['base currency'].value,
          exporter: 'test exporter',
        },
      ];

      const errors = validateRows(csvData, []);

      expect(errors).toEqual(expectedErrors);
    });
  });

  describe('when the facility utilisation does not match for a facility', () => {
    const csvData = generateCSVData(currencyValue, '45');

    it('should return an error for "facility utilisation"', () => {
      const expectedErrors = [
        {
          errorMessage: 'The utilisation does not match the other records for this facility. Enter the correct utilisation.',
          column: 'F',
          row: 1,
          value: csvData[1]['facility utilisation'].value,
          exporter: 'test exporter',
        },
      ];

      const errors = validateRows(csvData, []);

      expect(errors).toEqual(expectedErrors);
    });
  });

  describe('when both values match', () => {
    const csvData = generateCSVData(currencyValue, facilityUtilisationValue);

    it('should return an empty array', () => {
      const errors = validateRows(csvData, []);

      expect(errors).toEqual([]);
    });
  });
});
