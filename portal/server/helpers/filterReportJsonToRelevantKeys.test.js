import { UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';
import { filterReportJsonToRelevantKeys } from './filterReportJsonToRelevantKeys';

describe('filterReportJson', () => {
  it('should remove keys from a report json', () => {
    const reportData = [
      {
        wrongKey: 'test',
        [UTILISATION_REPORT_HEADERS.BASE_CURRENCY]: 'GBP',
        [UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]: '100000',
      },
      {
        wrongKey: 'test',
        [UTILISATION_REPORT_HEADERS.BASE_CURRENCY]: 'GBP',
        [UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]: '200000',
      },
    ];

    const result = filterReportJsonToRelevantKeys(reportData);

    const reportDataWithReportHeaderKeysOnly = [
      {
        [UTILISATION_REPORT_HEADERS.BASE_CURRENCY]: 'GBP',
        [UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]: '100000',
      },
      {
        [UTILISATION_REPORT_HEADERS.BASE_CURRENCY]: 'GBP',
        [UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]: '200000',
      },
    ];

    expect(result).toEqual(reportDataWithReportHeaderKeysOnly);
  });
});
