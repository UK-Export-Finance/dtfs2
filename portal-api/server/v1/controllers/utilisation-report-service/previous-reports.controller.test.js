const { getYears, groupReportsByYear, populateOmittedYears, groupAndSortReports } = require('./previous-reports.controller');

describe('controllers/utilisation-report-service/previous-reports', () => {
  const azureFileInfo = {
    folder: 'test_bank',
    filename: '2021_January_test_bank_utilisation_report.csv',
    fullPath: 'test_bank/2021_January_test_bank_utilisation_report.csv',
    url: 'test.url.csv',
    mimetype: 'text/csv',
  };

  const year2020Reports = [
    {
      bankId: '9',
      reportPeriod: {
        start: {
          month: 12,
          year: 2020,
        },
        end: {
          month: 12,
          year: 2020,
        },
      },
      dateUploaded: '2023-02-01T00:00',
      azureFileInfo,
      uploadedById: '1',
    },
  ];

  const year2022Reports = [
    {
      bankId: '9',
      reportPeriod: {
        start: {
          month: 1,
          year: 2022,
        },
        end: {
          month: 1,
          year: 2022,
        },
      },
      dateUploaded: '2023-02-01T00:00',
      azureFileInfo,
      uploadedById: '1',
    },
  ];

  const year2023Reports = [
    {
      bankId: '9',
      reportPeriod: {
        start: {
          month: 2,
          year: 2023,
        },
        end: {
          month: 4,
          year: 2023,
        },
      },
      dateUploaded: '2023-02-01T00:00',
      azureFileInfo,
      uploadedById: '1',
    },
  ];

  const reportSpanning2022and2023 = {
    bankId: '9',
    reportPeriod: {
      start: {
        month: 11,
        year: 2022,
      },
      end: {
        month: 1,
        year: 2023,
      },
    },
    dateUploaded: '2023-02-01T00:00',
    azureFileInfo,
    uploadedById: '1',
  };

  const reports = [...year2020Reports, ...year2022Reports, ...year2023Reports, reportSpanning2022and2023];

  const years = [2020, 2022, 2023];

  const groupedReports = [
    { year: 2020, reports: year2020Reports },
    { year: 2022, reports: [...year2022Reports, reportSpanning2022and2023] },
    { year: 2023, reports: [...year2023Reports, reportSpanning2022and2023] },
  ];

  const groupedReportsWithOmittedYears = [...groupedReports, { year: 2021, reports: [] }];

  const sortedReportsByDescendingYear = [
    { year: 2023, reports: [...year2023Reports, reportSpanning2022and2023] },
    { year: 2022, reports: [...year2022Reports, reportSpanning2022and2023] },
    { year: 2021, reports: [] },
    { year: 2020, reports: year2020Reports },
  ];

  describe('getYears', () => {
    it('should return unique array of years', () => {
      const uniqueYears = getYears(reports);

      expect(uniqueYears).toEqual(years);
    });
  });

  describe('groupReportsByYear', () => {
    it('should return list of reports grouped by year', () => {
      const groupedListOfReports = groupReportsByYear(years, reports);

      expect(groupedListOfReports).toEqual(groupedReports);
    });
  });

  describe('populateOmittedYears', () => {
    it('should return grouped reports with omitted years populated at the end of the array', () => {
      const groupedListOfReports = groupReportsByYear(years, reports);
      const reportsGroupedByYear = populateOmittedYears(groupedListOfReports, years);

      expect(reportsGroupedByYear).toEqual(groupedReportsWithOmittedYears);
    });
  });

  describe('groupAndSortReports', () => {
    it('should return array of grouped reports sorted by descending year', () => {
      const result = groupAndSortReports(reports);

      expect(result).toEqual(sortedReportsByDescendingYear);
    });
  });
});
