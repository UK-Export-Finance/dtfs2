import { UTILISATION_REPORT_HEADERS, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import { validateHeaders, getHeaderIsMissingErrorMessage } from './index';

const requiredHeaders = [
  UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID,
  UTILISATION_REPORT_HEADERS.BASE_CURRENCY,
  UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION,
  UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED,
  UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD,
  UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY,
];

const aCsvRowDataWithAllRequiredHeadings = (): UtilisationReportCsvRowData => {
  const rowData: UtilisationReportCsvRowData = {};
  requiredHeaders.forEach((header) => {
    rowData[header] = { value: null, column: 'A', row: 1 };
  });

  return rowData;
};

describe('getHeaderIsMissingErrorMessage', () => {
  it("returns the passed in string followed by the text 'header is missing or spelt incorrectly'", () => {
    // Arrange
    const header = 'some string';

    // Act
    const error = getHeaderIsMissingErrorMessage(header);

    // Assert
    expect(error).toEqual(`${header} header is missing or spelt incorrectly`);
  });
});

describe('validateHeaders', () => {
  it.each`
    header                                                     | errorPrefix
    ${UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID}             | ${'UKEF facility ID'}
    ${UTILISATION_REPORT_HEADERS.BASE_CURRENCY}                | ${'Base currency'}
    ${UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION}         | ${'Facility utilisation'}
    ${UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED}           | ${'Total fees accrued for the period'}
    ${UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD}          | ${'Fees paid to UKEF for the period'}
    ${UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY} | ${'Fees paid to UKEF currency'}
  `('returns an error if $header header is missing', ({ header, errorPrefix }: { header: string; errorPrefix: string }) => {
    // Arrange
    const csvData = aCsvRowDataWithAllRequiredHeadings();
    delete csvData[header];

    // Act
    const { missingHeaderErrors } = validateHeaders(csvData);

    // Assert
    expect(missingHeaderErrors.length).toEqual(1);
    expect(missingHeaderErrors[0].errorMessage).toEqual(`${errorPrefix} header is missing or spelt incorrectly`);
  });

  it('returns no errors when no headers are missing', () => {
    // Arrange
    const csvData = aCsvRowDataWithAllRequiredHeadings();

    // Act
    const { missingHeaderErrors } = validateHeaders(csvData);

    // Assert
    expect(missingHeaderErrors.length).toEqual(0);
  });

  it('returns multiple errors if multiple headers are missing', () => {
    // Arrange
    const csvData = aCsvRowDataWithAllRequiredHeadings();
    delete csvData[UTILISATION_REPORT_HEADERS.BASE_CURRENCY];
    delete csvData[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY];
    delete csvData[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION];
    // This field is facility utilisation but with a typo
    csvData['faculty utilisation'] = { value: '800000', row: 1, column: 'A' };

    // Act
    const { missingHeaderErrors } = validateHeaders(csvData);

    // Assert
    expect(missingHeaderErrors.length).toEqual(3);
  });
});
