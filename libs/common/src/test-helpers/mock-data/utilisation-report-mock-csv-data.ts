import { UtilisationReportCsvRowData } from '../../types';

export const mockCurrencyValue = 'EUR';
export const mockFacilityUtilisationValue = '34538.54';

export const generateUtilisationReportMockCSVData = (currency: string, utilisation: string): UtilisationReportCsvRowData[] => {
  return [
    {
      'ukef facility id': { value: '20001371', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: mockCurrencyValue, column: 'D', row: 1 },
      'facility utilisation': { value: mockFacilityUtilisationValue, column: 'F', row: 1 },
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
      'facility utilisation': { value: mockFacilityUtilisationValue, column: 'F', row: 3 },
    },
  ];
};
