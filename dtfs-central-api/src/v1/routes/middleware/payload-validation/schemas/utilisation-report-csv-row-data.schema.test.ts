import { CURRENCY } from '@ukef/dtfs2-common';
import { UtilisationReportCsvRowDataSchema } from './utilisation-report-csv-row-data.schema';

describe('utilisation-report-raw-csv-cell-data-with-location.schema', () => {
  describe('UtilisationReportCsvRowDataSchema', () => {
    it.each`
      condition      | testValue
      ${'undefined'} | ${undefined}
      ${'number'}    | ${7}
      ${'Object'}    | ${{}}
      ${'array'}     | ${[]}
    `("sets the 'success' property to false when the cell value is: $condition", ({ testValue }: { testValue: unknown }) => {
      // Arrange
      const invalidRowData = { 'some key': { value: testValue, row: 3, column: 'E' } };

      // Act
      const { success } = UtilisationReportCsvRowDataSchema.safeParse(invalidRowData);

      // Assert
      expect(success).toEqual(false);
    });

    it.each`
      condition      | testValue
      ${'null'}      | ${null}
      ${'undefined'} | ${undefined}
      ${'number'}    | ${7}
      ${'Object'}    | ${{}}
      ${'array'}     | ${[]}
    `("sets the 'success' property to false when the cell column is: $condition", ({ testValue }: { testValue: unknown }) => {
      // Arrange
      const invalidRowData = { 'some key': { value: 'value', row: 3, column: testValue } };

      // Act
      const { success } = UtilisationReportCsvRowDataSchema.safeParse(invalidRowData);

      // Assert
      expect(success).toEqual(false);
    });

    it.each`
      condition      | testValue
      ${'null'}      | ${null}
      ${'undefined'} | ${undefined}
      ${'Object'}    | ${{}}
      ${'array'}     | ${[]}
    `("sets the 'success' property to false when the cell row is: $condition", ({ testValue }: { testValue: unknown }) => {
      // Arrange
      const invalidRowData = { 'some key': { value: 'value', row: testValue, column: 'R' } };

      // Act
      const { success } = UtilisationReportCsvRowDataSchema.safeParse(invalidRowData);

      // Assert
      expect(success).toEqual(false);
    });

    it.each`
      valueCondition | value            | rowCondition | row
      ${'null'}      | ${null}          | ${'number'}  | ${1}
      ${'string'}    | ${'some string'} | ${'number'}  | ${200}
      ${'null'}      | ${null}          | ${'string'}  | ${'13'}
      ${'string'}    | ${'some string'} | ${'string'}  | ${'1'}
    `(
      "sets the 'success' property to true when the cell column is a string and the cell value is $valueCondition and the cell row is $rowCondition",
      ({ value, row }: { value: unknown; row: unknown }) => {
        // Arrange
        const validRowData = { 'some key': { value, row, column: 'R' } };

        // Act
        const result = UtilisationReportCsvRowDataSchema.safeParse(validRowData);

        // Assert
        expect(result.success).toEqual(true);
      },
    );

    it("set the 'data' property to the parsed csv row data", () => {
      // Arrange
      const validRowData = {
        'some key': { value: null, row: 1, column: 'A' },
        'some other key': { value: CURRENCY.GBP, row: 1, column: 'B' },
      };

      // Act
      const { data } = UtilisationReportCsvRowDataSchema.safeParse(validRowData);

      // Assert
      expect(data).toEqual({
        'some key': { value: null, row: 1, column: 'A' },
        'some other key': { value: CURRENCY.GBP, row: 1, column: 'B' },
      });
    });
  });
});
