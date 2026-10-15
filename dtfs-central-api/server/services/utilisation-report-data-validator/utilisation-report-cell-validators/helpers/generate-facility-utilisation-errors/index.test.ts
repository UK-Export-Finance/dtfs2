import { generateUtilisationReportMockCSVData } from '@ukef/dtfs2-common/test-helpers';
import { CURRENCY, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import { addErrorOnEveryRow } from '../add-error-on-every-row';
import { generateFacilityUtilisationErrors } from '.';

describe('services/utilisation-report-data-validator/utilisation-report-cell-validators/helpers/generate-facility-utilisation-errors', () => {
  const errorMessage = 'The utilisation does not match the other records for this facility. Enter the correct utilisation.';
  const field = 'facility utilisation';

  describe('when the facility utilisation does not match', () => {
    const csvData = generateUtilisationReportMockCSVData(CURRENCY.GBP, '100');

    const rows = [csvData[0], csvData[1]] as UtilisationReportCsvRowData[];

    const completeRows = [
      {
        ...csvData[0],
        'facility utilisation': {
          ...csvData[0]['facility utilisation'],
          value: '45',
        },
      },
      {
        ...csvData[1],
        'facility utilisation': {
          ...csvData[1]['facility utilisation'],
          value: '100',
        },
      },
    ] as UtilisationReportCsvRowData[];

    it(`should return the result of "addErrorOnEveryRow" for "${field}"`, () => {
      // Act
      const result = generateFacilityUtilisationErrors(rows, completeRows);

      // Assert
      const expectedErrors = addErrorOnEveryRow(rows, field, errorMessage);

      expect(result).toEqual(expectedErrors);
    });
  });

  describe('when the facility utilisation matches', () => {
    const csvData = generateUtilisationReportMockCSVData(CURRENCY.GBP, '100');

    const rows = [csvData[0], csvData[1]] as UtilisationReportCsvRowData[];

    const completeRows = [
      {
        ...csvData[0],
        'facility utilisation': {
          ...csvData[0]['facility utilisation'],
          value: '100',
        },
      },
      {
        ...csvData[1],
        'facility utilisation': {
          ...csvData[1]['facility utilisation'],
          value: '100',
        },
      },
    ] as UtilisationReportCsvRowData[];

    it(`should return an empty array for "${field}"`, () => {
      // Act
      const result = generateFacilityUtilisationErrors(rows, completeRows);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
