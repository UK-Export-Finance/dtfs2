import { UtilisationReportRawCsvRowDataWithLocationsSchema } from './utilisation-report-raw-csv-row-data-with-location.schema';

describe('utilisation-report-raw-csv-cell-data-with-location.schema', () => {
  describe('UtilisationReportRawCsvRowDataWithLocationsSchema', () => {
    it.each`
      condition      | testValue
      ${'undefined'} | ${undefined}
      ${'number'}    | ${7}
      ${'object'}    | ${{}}
      ${'array'}     | ${[]}
    `("sets the 'success' property to false when the cell value is: $condition", (testValue: unknown) => {
      // Arrange
      const invalidRowData = { 'some key': { value: testValue, row: 3, column: 'E' } };

      // Act
      const { success } = UtilisationReportRawCsvRowDataWithLocationsSchema.safeParse(invalidRowData);

      // Assert
      expect(success).toBe(false);
    });

    it.each`
      condition      | testValue
      ${'null'}      | ${null}
      ${'undefined'} | ${undefined}
      ${'number'}    | ${7}
      ${'object'}    | ${{}}
      ${'array'}     | ${[]}
    `("sets the 'success' property to false when the cell column is: $condition", (testValue: unknown) => {
      // Arrange
      const invalidRowData = { 'some key': { value: 'value', row: 3, column: testValue } };

      // Act
      const { success } = UtilisationReportRawCsvRowDataWithLocationsSchema.safeParse(invalidRowData);

      // Assert
      expect(success).toBe(false);
    });

    it.each`
      condition      | testValue
      ${'null'}      | ${null}
      ${'undefined'} | ${undefined}
      ${'object'}    | ${{}}
      ${'array'}     | ${[]}
    `("sets the 'success' property to false when the cell row is: $condition", (testValue: unknown) => {
      // Arrange
      const invalidRowData = { 'some key': { value: 'value', row: testValue, column: 'R' } };

      // Act
      const { success } = UtilisationReportRawCsvRowDataWithLocationsSchema.safeParse(invalidRowData);

      // Assert
      expect(success).toBe(false);
    });

    it.each`
      valueCondition | value            | rowCondition | row
      ${'null'}      | ${null}          | ${'number'}  | ${1}
      ${'string'}    | ${'some string'} | ${'number'}  | ${200}
      ${'null'}      | ${null}          | ${'string'}  | ${'13'}
      ${'string'}    | ${'some string'} | ${'string'}  | ${'1'}
    `(
      "sets the 'success' property to true when the cell column is a string and the cell value is $valueCondition and the cell row is $rowCondition",
      (value: unknown, row: unknown) => {
        // Arrange
        const invalidRowData = { 'some key': { value, row, column: 'R' } };

        // Act
        const { success } = UtilisationReportRawCsvRowDataWithLocationsSchema.safeParse(invalidRowData);

        // Assert
        expect(success).toBe(true);
      },
    );

    it("set the 'data' property to the parsed csv row data", () => {
      // Arrange
      const validRowData = {
        'some key': { value: null, row: 1, column: 'A' },
        'some other key': { value: 'GBP', row: 1, column: 'B' },
      };

      // Act
      const { data } = UtilisationReportRawCsvRowDataWithLocationsSchema.safeParse(validRowData);

      // Assert
      expect(data).toBe({
        'some key': { value: null, row: 1, column: 'A' },
        'some other key': { value: 'GBP', row: 1, column: 'B' },
      });
    });
  });
});
