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
    uploadedBy: user,
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
    uploadedBy: user,
  };

  it('should return an empty object if the report is undefined', () => {
    const response = getReportAndUserDetails(undefined);

    expect(response).toEqual({});
  });

  it('should return the correct full name, date format and report period for a report uploaded in the morning', () => {
    const { uploadedByFullName, formattedDateAndTimeUploaded, lastUploadedReportPeriod } = getReportAndUserDetails(morningReport);

    expect(uploadedByFullName).toBe('John Smith');
    expect(formattedDateAndTimeUploaded).toBe('8 April 2023 at 10:35am');
    expect(lastUploadedReportPeriod).toBe('April 2023');
  });

  it('should return the correct full name, date format and report period for a report uploaded in the afternoon', () => {
    const { uploadedByFullName, formattedDateAndTimeUploaded, lastUploadedReportPeriod } = getReportAndUserDetails(afternoonReport);

    expect(uploadedByFullName).toBe('John Smith');
    expect(formattedDateAndTimeUploaded).toBe('8 April 2023 at 3:23pm');
    expect(lastUploadedReportPeriod).toBe('April 2023');
  });
});
