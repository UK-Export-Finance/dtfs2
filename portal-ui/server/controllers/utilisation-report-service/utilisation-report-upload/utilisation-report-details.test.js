const { getReportAndUserDetails } = require('./utilisation-report-details');

describe('utilisation-report-details', () => {
  const user = {
    firstname: 'John',
    surname: 'Smith',
  };
  const morningReport = {
    _id: 'abc',
    bankId: '1',
    reportPeriod: {
      start: {
        month: 4,
        year: 2023,
      },
      end: {
        month: 4,
        year: 2023,
      },
    },
    dateUploaded: '2023-04-08T10:35:31',
    path: 'www.abc.com',
    uploadedByUser: user,
  };
  const afternoonReport = {
    _id: 'def',
    bankId: '1',
    reportPeriod: {
      start: {
        month: 4,
        year: 2023,
      },
      end: {
        month: 4,
        year: 2023,
      },
    },
    dateUploaded: '2023-04-08T15:23:10',
    path: 'www.abc.com',
    uploadedByUser: user,
  };

  it('should throw an error if the report is undefined', () => {
    // Act/Assert
    expect(() => getReportAndUserDetails(undefined)).toThrow(new Error("Failed to get report and user details: 'report' was undefined"));
  });

  it('should return the correct full name, date format and report period for a report uploaded in the morning', () => {
    const { uploadedByFullName, formattedDateAndTimeUploaded, lastUploadedReportPeriod } = getReportAndUserDetails(morningReport);

    expect(uploadedByFullName).toEqual('John Smith');
    expect(formattedDateAndTimeUploaded).toEqual('8 April 2023 at 10:35am');
    expect(lastUploadedReportPeriod).toEqual('April 2023');
  });

  it('should return the correct full name, date format and report period for a report uploaded in the afternoon', () => {
    const { uploadedByFullName, formattedDateAndTimeUploaded, lastUploadedReportPeriod } = getReportAndUserDetails(afternoonReport);

    expect(uploadedByFullName).toEqual('John Smith');
    expect(formattedDateAndTimeUploaded).toEqual('8 April 2023 at 3:23pm');
    expect(lastUploadedReportPeriod).toEqual('April 2023');
  });
});
