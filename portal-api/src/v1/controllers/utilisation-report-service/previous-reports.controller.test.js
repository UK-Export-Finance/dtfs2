const {
  getYears,
  getReportsGroupedByYear,
  populateOmittedYears,
  mapAndSortReports,
} = require('./previous-reports.controller');

describe('controllers/utilisation-report-service/previous-reports', () => {
  const reports = [{
    bankId: '9',
    month: 12,
    year: 2020,
    uploadedDate: '2023-02-01T00:00',
    uploadedById: '1',
    path: 'www.abc.com',
  }, {
    bankId: '9',
    month: 1,
    year: 2022,
    uploadedDate: '2023-02-01T00:00',
    uploadedById: '1',
    path: 'www.abc.com',
  }, {
    bankId: '9',
    month: 1,
    year: 2023,
    uploadedDate: '2023-02-01T00:00',
    uploadedById: '1',
    path: 'www.abc.com',
  }, {
    bankId: '9',
    month: 2,
    year: 2023,
    uploadedDate: '2023-02-01T00:00',
    uploadedById: '1',
    path: 'www.abc.com',
  }];

  const years = [2020, 2022, 2023];

  const groupedReports = [{
    year: 2020,
    reports: [{
      month: 'December',
      path: 'www.abc.com',
    }],
  }, {
    year: 2022,
    reports: [{
      month: 'January',
      path: 'www.abc.com',
    }],
  }, {
    year: 2023,
    reports: [{
      month: 'January',
      path: 'www.abc.com',
    }, {
      month: 'February',
      path: 'www.abc.com',
    }],
  }];

  const groupedReportsWithOmittedYears = [{
    year: 2020,
    reports: [{
      month: 'December',
      path: 'www.abc.com',
    }],
  }, {
    year: 2022,
    reports: [{
      month: 'January',
      path: 'www.abc.com',
    }],
  }, {
    year: 2023,
    reports: [{
      month: 'January',
      path: 'www.abc.com',
    }, {
      month: 'February',
      path: 'www.abc.com',
    }],
  }, {
    year: 2021,
    reports: [],
  }];

  const sortedReportsByDescendingYear = [{
    year: 2023,
    reports: [{
      month: 'January',
      path: 'www.abc.com',
    }, {
      month: 'February',
      path: 'www.abc.com',
    }],
  }, {
    year: 2022,
    reports: [{
      month: 'January',
      path: 'www.abc.com',
    }],
  }, {
    year: 2021,
    reports: [],
  }, {
    year: 2020,
    reports: [{
      month: 'December',
      path: 'www.abc.com',
    }],
  }];

  describe('getYears', () => {
    it('should return unique array of years', () => {
      const uniqueYears = getYears(reports);

      expect(uniqueYears).toEqual(years);
    });
  });

  describe('getReportsGroupedByYear', () => {
    it('should return list of reports grouped by year', () => {
      const groupedListOfReports = getReportsGroupedByYear(years, reports);

      expect(groupedListOfReports).toEqual(groupedReports);
    });
  });

  describe('populateOmittedYears', () => {
    it('should return grouped reports with omitted years populated at the end of the array', () => {
      const groupedListOfReports = getReportsGroupedByYear(years, reports);
      const reportsGroupedByYear = populateOmittedYears(groupedListOfReports, years);

      expect(reportsGroupedByYear).toEqual(groupedReportsWithOmittedYears);
    });
  });

  describe('mapAndSortReports', () => {
    it('should return array of grouped reports sorted by descending year', () => {
      const result = mapAndSortReports(reports);

      expect(result).toEqual(sortedReportsByDescendingYear);
    });
  });
});
