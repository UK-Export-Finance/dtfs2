import { sendFailureAlertEmail } from './send-failure-alert-email';

describe('sendFailureAlertEmail', () => {
  const originalNotificationEmail = process.env.UKEF_INTERNAL_NOTIFICATION;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.UKEF_INTERNAL_NOTIFICATION = 'alerts@test.com';
  });

  afterEach(() => {
    process.env.UKEF_INTERNAL_NOTIFICATION = originalNotificationEmail;
    jest.restoreAllMocks();
  });

  it('should send a failure alert email with the provided template and message', async () => {
    // Arrange
    const sendEmail = jest.fn().mockResolvedValue(undefined);

    // Act
    await sendFailureAlertEmail(sendEmail, 'template-id', 'eStore directories', 'payload failed');

    // Assert
    expect(sendEmail).toHaveBeenNthCalledWith(1, 'template-id', 'alerts@test.com', {
      jobName: 'eStore directories',
      message: 'payload failed',
    });
  });

  it('should include dealIdentifier when provided', async () => {
    // Arrange
    const sendEmail = jest.fn().mockResolvedValue(undefined);

    // Act
    await sendFailureAlertEmail(sendEmail, 'template-id', 'ACBS create payload', 'payload failed', 'D-001');

    // Assert
    expect(sendEmail).toHaveBeenNthCalledWith(1, 'template-id', 'alerts@test.com', {
      dealIdentifier: 'D-001',
      jobName: 'ACBS create payload',
      message: 'payload failed',
    });
  });

  it('should log and swallow send email errors', async () => {
    // Arrange
    const error = new Error('notify failed');
    const sendEmail = jest.fn().mockRejectedValueOnce(error);

    // Act
    await sendFailureAlertEmail(sendEmail, 'template-id', 'eStore directories', 'payload failed');

    // Assert
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      'Failed to send failure alert email. templateId=%s job=%s recipient=%s error=%o',
      'template-id',
      'eStore directories',
      'alerts@test.com',
      error,
    );
  });

  it('should log when send email returns null', async () => {
    // Arrange
    const sendEmail = jest.fn().mockResolvedValueOnce(null);

    // Act
    await sendFailureAlertEmail(sendEmail, 'template-id', 'eStore directories', 'payload failed');

    // Assert
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      'Failed to send failure alert email. templateId=%s job=%s recipient=%s error=%o',
      'template-id',
      'eStore directories',
      'alerts@test.com',
      new Error('sendEmail returned null'),
    );
  });
});
