import { UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import { addErrorOnEveryRow } from '.';

describe('services/utilisation-report-data-validator/utilisation-report-cell-validators/helpers/add-error-on-every-row', () => {
  it('should add an error for the field on every row', () => {
    // Arrange
    const rows = [
      {
        'facility utilisation': { column: '1', row: 1, value: 'value1' },
        exporter: { value: 'exporter1' },
      },
      {
        'facility utilisation': { column: '2', row: 2, value: 'value2' },
        exporter: { value: 'exporter2' },
      },
    ] as UtilisationReportCsvRowData[];

    const field = 'facility utilisation';
    const errorMessage = 'The utilisation does not match the other records for this facility. Enter the correct utilisation.';

    // Act
    const result = addErrorOnEveryRow(rows, field, errorMessage);

    // Assert
    const expectedErrors = [
      {
        errorMessage,
        column: '1',
        row: 1,
        value: 'value1',
        exporter: 'exporter1',
      },
      {
        errorMessage,
        column: '2',
        row: 2,
        value: 'value2',
        exporter: 'exporter2',
      },
    ];

    expect(result).toEqual(expectedErrors);
  });
});
