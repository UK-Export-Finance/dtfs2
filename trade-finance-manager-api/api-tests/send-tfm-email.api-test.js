const sendTfmEmail = require('../src/v1/controllers/send-tfm-email');
const app = require('../src/createApp');
const api = require('./api')(app);
const externalApis = require('../src/v1/api');
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../src/v1/__mocks__/mock-notify-email-response');

describe('sendTfmEmail', () => {
  const templateId = 'MOCK-NOTIFY-TEMPLATE-ID';
  const sendToEmailAddress = 'test@testing.com';
  const emailVariables = {
    name: 'Testing',
  };

  const sendEmailApiSpy = jest.fn(() => Promise.resolve(
    MOCK_NOTIFY_EMAIL_RESPONSE,
  ));

  beforeEach(() => {
    externalApis.sendEmail = sendEmailApiSpy;
  });

  it('should call api.sendEmail', async () => {
    await sendTfmEmail(
      templateId,
      sendToEmailAddress,
      emailVariables,
    );

    expect(sendEmailApiSpy).toHaveBeenCalledWith(
      templateId,
      sendToEmailAddress,
      emailVariables,
    );
  });

  it('should return response from api.sendEmail', async () => {
    const result = await sendTfmEmail(
      templateId,
      sendToEmailAddress,
      emailVariables,
    );

    expect(result).toEqual(MOCK_NOTIFY_EMAIL_RESPONSE);
  });
});
