const { HttpStatusCode } = require('axios');
const httpMocks = require('node-mocks-http');
const events = require('events');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('@ukef/dtfs2-common');
const { aUtilisationReportResponse, aNotReceivedUtilisationReportResponse } = require('../../../../test-helpers/test-data/utilisation-report');
const { saveUtilisationReportFileToAzure } = require('../../services/utilisation-report/azure-file-service');
const {
  sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam,
  sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam,
} = require('../../services/utilisation-report/email-service');
const { uploadReportAndSendNotification } = require('.');
const { saveUtilisationReport, getUtilisationReports } = require('../../api');

jest.mock('../../services/utilisation-report/email-service');
jest.mock('../../services/utilisation-report/azure-file-service');
jest.mock('../../api');
console.error = jest.fn();
console.info = jest.fn();

describe('controllers/utilisation-report-service/utilisation-report-upload', () => {
  const file = {
    originalname: 'test_file.csv',
    buffer: Buffer.from('test'),
  };

  const PARSED_REPORT_DATA = [];
  const PARSED_USER = { firstname: 'first', surname: 'last', bank: { id: '123' } };

  const getHttpMocks = () =>
    httpMocks.createMocks(
      {
        file,
        body: {
          formattedReportPeriod: 'June 2024',
          reportData: '[]',
          reportPeriod: '{ "start": { "month": 6, "year": 2026 }, "end": { "month": 6, "year": 2026 }}',
          user: '{ "firstname": "first", "surname": "last", "bank": { "id": "123" } }',
        },
      },
      { eventEmitter: events.EventEmitter },
    );

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns a 400 if no file is provided', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.file = undefined;

    // Act
    await uploadReportAndSendNotification(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
  });

  it('does not upload report and returns a 500 if there are no reports for period', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    jest.mocked(getUtilisationReports).mockResolvedValue([]);

    // Act
    await uploadReportAndSendNotification(req, res);

    // Assert
    expect(saveUtilisationReportFileToAzure).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
  });

  it('does not upload report and returns a 500 if there are more than one reports for period', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    jest.mocked(getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse(), aNotReceivedUtilisationReportResponse()]);

    // Act
    await uploadReportAndSendNotification(req, res);

    // Assert
    expect(saveUtilisationReportFileToAzure).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
  });

  it('does not upload report and returns a 500 with error message if report has already been received', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    jest.mocked(getUtilisationReports).mockResolvedValue([{ ...aUtilisationReportResponse(), status: 'PENDING_RECONCILIATION' }]);

    // Act
    await uploadReportAndSendNotification(req, res);

    // Assert
    expect(saveUtilisationReportFileToAzure).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    expect(res._getData()).toBe(
      `Expected report to be in '${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED}' state (was actually in '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}' state)`,
    );
  });

  it('uploads report and sends notification emails', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const report = aNotReceivedUtilisationReportResponse();
    const fileInfo = { folder: 'folder', filename: 'info', fullPath: 'folder/path', url: 'url', mimetype: 'text/csv' };
    jest.mocked(getUtilisationReports).mockResolvedValue([report]);
    jest.mocked(saveUtilisationReportFileToAzure).mockResolvedValue(fileInfo);
    jest.mocked(saveUtilisationReport).mockResolvedValue({ dateUploaded: '2024-12-21' });

    // Act
    await uploadReportAndSendNotification(req, res);

    // Assert
    expect(saveUtilisationReportFileToAzure).toHaveBeenCalledTimes(1);
    expect(saveUtilisationReport).toHaveBeenCalledTimes(1);
    expect(saveUtilisationReport).toHaveBeenCalledWith(report.id, PARSED_REPORT_DATA, PARSED_USER, fileInfo);
    expect(sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam).toHaveBeenCalledTimes(1);
    expect(sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam).toHaveBeenCalledTimes(1);
  });

  it('responds with a 200 and the bank team recipient emails when uploading is successful', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    jest.mocked(getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);
    jest.mocked(saveUtilisationReportFileToAzure).mockResolvedValue({ folder: 'folder', filename: 'info', fullPath: 'folder/path', url: 'url' });
    jest.mocked(saveUtilisationReport).mockResolvedValue({ dateUploaded: '2024-12-21' });
    jest.mocked(sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam).mockResolvedValue({ paymentOfficerEmails: ['email'] });

    // Act
    await uploadReportAndSendNotification(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.Created);
    expect(res._getData()).toEqual({ paymentOfficerEmails: ['email'] });
  });

  it('uploads report and returns a 200 if sending report upload notification email to gef reporting team fails', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    jest.mocked(getUtilisationReports).mockResolvedValue([aNotReceivedUtilisationReportResponse()]);
    jest.mocked(saveUtilisationReportFileToAzure).mockResolvedValue({ folder: 'folder', filename: 'info', fullPath: 'folder/path', url: 'url' });
    jest.mocked(saveUtilisationReport).mockResolvedValue({ dateUploaded: '2024-12-21' });
    jest.mocked(sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam).mockRejectedValue(new Error('Failed to send email'));
    jest.mocked(sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam).mockResolvedValue({ paymentOfficerEmails: ['email'] });

    // Act
    await uploadReportAndSendNotification(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.Created);
    expect(res._getData()).toEqual({ paymentOfficerEmails: ['email'] });
  });
});
