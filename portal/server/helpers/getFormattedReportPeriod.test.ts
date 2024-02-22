import { ReportPeriod } from '../types/utilisation-reports';
import { getFormattedReportPeriod } from './getFormattedReportPeriod';

describe('getFormattedReportPeriod', () => {
  const testData: { description: string; reportPeriod: ReportPeriod; expectedResponse: string }[] = [
    {
      description: 'report period spans 1 month',
      reportPeriod: {
        start: {
          month: 1,
          year: 2023,
        },
        end: {
          month: 1,
          year: 2023,
        },
      },
      expectedResponse: 'January 2023',
    },
    {
      description: 'report period spans multiple months in the same year',
      reportPeriod: {
        start: {
          month: 3,
          year: 2023,
        },
        end: {
          month: 5,
          year: 2023,
        },
      },
      expectedResponse: 'March to May 2023',
    },
    {
      description: 'report period spans multiple months over 2 years',
      reportPeriod: {
        start: {
          month: 12,
          year: 2022,
        },
        end: {
          month: 2,
          year: 2023,
        },
      },
      expectedResponse: 'December 2022 to February 2023',
    },
  ];
  it.each(testData)('returns $expectedResponse when $description', ({ reportPeriod, expectedResponse }) => {
    const response = getFormattedReportPeriod(reportPeriod);

    expect(response).toEqual(expectedResponse);
  });
});
