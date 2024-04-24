const { HttpStatusCode } = require('axios');
const httpMocks = require('node-mocks-http');
const events = require('events');
const { validateReportForPeriodIsInReportNotReceivedStateAndReturnId } = require('../../validation/utilisation-report/utilisation-report-upload-validator');
const { saveUtilisationReportFileToAzure } = require('../../services/utilisation-report/azure-file-service');
const {
  sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam,
  sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam,
} = require('../../services/utilisation-report/email-service');
const { uploadReportAndSendNotification } = require('.');
const { InvalidReportStatusError } = require('../../errors');
const { saveUtilisationReport } = require('../../api');

jest.mock('../../validation/utilisation-report/utilisation-report-upload-validator');
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

  it('does not upload report and returns a 500 with error message if report is not expected to be received', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    jest.mocked(validateReportForPeriodIsInReportNotReceivedStateAndReturnId).mockRejectedValue(new InvalidReportStatusError('validation failed!'));

    // Act
    await uploadReportAndSendNotification(req, res);

    // Assert
    expect(validateReportForPeriodIsInReportNotReceivedStateAndReturnId).toHaveBeenCalledTimes(1);
    expect(saveUtilisationReportFileToAzure).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
    expect(res._getData()).toBe('validation failed!');
  });

  it('uploads report and sends notification emails', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    jest.mocked(validateReportForPeriodIsInReportNotReceivedStateAndReturnId).mockResolvedValue(1);
    jest.mocked(saveUtilisationReportFileToAzure).mockResolvedValue({ folder: 'folder', filename: 'info', fullPath: 'folder/path', url: 'url' });
    jest.mocked(saveUtilisationReport).mockResolvedValue({ dateUploaded: '2024-12-21' });

    // Act
    await uploadReportAndSendNotification(req, res);

    // Assert
    expect(validateReportForPeriodIsInReportNotReceivedStateAndReturnId).toHaveBeenCalledTimes(1);
    expect(saveUtilisationReportFileToAzure).toHaveBeenCalledTimes(1);
    expect(saveUtilisationReport).toHaveBeenCalledTimes(1);
    expect(sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam).toHaveBeenCalledTimes(1);
    expect(sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam).toHaveBeenCalledTimes(1);
  });

  it('responds with a 200 and the bank team recipient emails when uploading is successful', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    jest.mocked(validateReportForPeriodIsInReportNotReceivedStateAndReturnId).mockResolvedValue(1);
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
    jest.mocked(validateReportForPeriodIsInReportNotReceivedStateAndReturnId).mockResolvedValue(1);
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
