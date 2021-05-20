const sendTfmEmail = require('./send-tfm-email');

describe('sendTfmEmail', () => {
  it('should return response from api.sendEmail', async () => {
    const templateId = '123-test';
    const sendToEmailAddress = 'test@testing.com';
    const emailVariables = {
      name: 'Testing',
    };

    const result = await sendTfmEmail(
      templateId,
      sendToEmailAddress,
      emailVariables,
    );

    // api response is mocked/stubbed
    const expected = {
      content: {
        body: {},
      },
      id: templateId,
      email: sendToEmailAddress,
      ...emailVariables,
      template: {},
    };

    expect(result).toEqual(expected);
  });
});
