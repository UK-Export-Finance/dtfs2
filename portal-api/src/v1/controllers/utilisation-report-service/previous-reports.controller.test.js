const { getMonthName, getGroupedReports, getExistingYear, } = require('./previous-reports.controller');

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

  const groupedReports = [{
    year: 2020,
    reports: [{
      month: "December",
      path: 'www.abc.com',
    }],
  }, {
    year: 2021,
    reports: [],
  }, {
    year: 2022,
    reports: [{
      month: "January",
      path: 'www.abc.com',
    }],
  }, {
    year: 2023,
    reports: [{
      month: "January",
      path: 'www.abc.com',
    }, {
      month: "February",
      path: 'www.abc.com',
    }],
  }]

  it.each([
    {
      monthNumber: 1,
      monthName: 'January',
    },
    {
      monthNumber: 2,
      monthName: 'February',
    },
    {
      monthNumber: 3,
      monthName: 'March',
    },
    {
      monthNumber: 4,
      monthName: 'April',
    },
    {
      monthNumber: 5,
      monthName: 'May',
    },
    {
      monthNumber: 6,
      monthName: 'June',
    },
    {
      monthNumber: 7,
      monthName: 'July',
    },
    {
      monthNumber: 8,
      monthName: 'August',
    },
    {
      monthNumber: 9,
      monthName: 'September',
    },
    {
      monthNumber: 10,
      monthName: 'October',
    },
    {
      monthNumber: 11,
      monthName: 'November',
    },
    {
      monthNumber: 12,
      monthName: 'December',
    },
  ])('should return month name from month number', (value) => {
    const monthName = getMonthName(value.monthNumber);

    expect(monthName).toEqual(value.monthName);
  });

  it('should return list of reports grouped by year and fill in missing years', () => {
    const groupedListOfReports = getGroupedReports(reports);
    
    expect(groupedListOfReports).toEqual(groupedReports);
  });

  it('should return existing year if it exists in groupedReports', () => {
    const existingYear = getExistingYear(groupedReports, 2023);

    expect(existingYear).toEqual(groupedReports[3]);
  });

  it('should return undefine existing year if it does not exist in groupedReports', () => {
    const existingYear = getExistingYear(groupedReports, 2000);

    expect(existingYear).toEqual(undefined);
  });
});
