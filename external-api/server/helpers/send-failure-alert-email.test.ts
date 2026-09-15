import { sendEmail } from '../v1/controllers/email.controller';

jest.mock('../v1/controllers/email.controller', () => ({
  sendEmail: jest.fn(),
}));

const mockedSendEmail = jest.mocked(sendEmail);
const originalNotificationEmail = process.env.UKEF_INTERNAL_NOTIFICATION;
let sendFailureAlertEmail: typeof import('./send-failure-alert-email').sendFailureAlertEmail;

describe('sendFailureAlertEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.UKEF_INTERNAL_NOTIFICATION = 'alerts@test.com';
    const failureAlertEmailModule = jest.requireActual<typeof import('./send-failure-alert-email')>('./send-failure-alert-email');

    sendFailureAlertEmail = failureAlertEmailModule.sendFailureAlertEmail;
  });

  afterEach(() => {
    process.env.UKEF_INTERNAL_NOTIFICATION = originalNotificationEmail;
    jest.restoreAllMocks();
  });

  it('should send a failure alert email with the provided template and message', async () => {
    await sendFailureAlertEmail('template-id', 'eStore directories', 'payload failed');

    expect(mockedSendEmail).toHaveBeenNthCalledWith(1, 'template-id', 'alerts@test.com', {
      jobName: 'eStore directories',
      message: 'payload failed',
    });
  });

  it('should include dealIdentifier when provided', async () => {
    await sendFailureAlertEmail('template-id', 'ACBS create payload', 'payload failed', 'D-001');

    expect(mockedSendEmail).toHaveBeenNthCalledWith(1, 'template-id', 'alerts@test.com', {
      dealIdentifier: 'D-001',
      jobName: 'ACBS create payload',
      message: 'payload failed',
    });
  });

  it('should log and swallow send email errors', async () => {
    const error = new Error('notify failed');
    mockedSendEmail.mockRejectedValueOnce(error);

    await sendFailureAlertEmail('template-id', 'eStore directories', 'payload failed');

    expect(console.error).toHaveBeenNthCalledWith(
      1,
      'Failed to send failure alert email. templateId=%s job=%s recipient=%s error=%o',
      'template-id',
      'eStore directories',
      'alerts@test.com',
      error,
    );
  });
});
