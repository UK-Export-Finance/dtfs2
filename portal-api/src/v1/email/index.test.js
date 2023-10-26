const mockNotifyClientSendEmail = jest.fn();

jest.mock('notifications-node-client', () => {
  return {
    NotifyClient: jest.fn().mockImplementation(() => {
      return { sendEmail: mockNotifyClientSendEmail };
    }),
  };
});

const sendEmail = require('./index');

describe('sendEmail', () => {
    const templateId = 'aTemplateId';
    const emailAddress = 'aEmail@aDomain.com';
    const emailVariables = { firstName: 'aFirstName', signInLink: 'aLink' };

    let originalConsoleError;

    beforeEach(() => {
      jest.resetAllMocks();
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error = originalConsoleError;
    });

    it('calls the sendEmail method on the notifyClient with the correct arguments', async () => {
      mockNotifyClientSendEmail.mockImplementation(() => Promise.resolve({}));

      await sendEmail(templateId, emailAddress, emailVariables);

      expect(mockNotifyClientSendEmail).toHaveBeenCalledWith(
          templateId,
          emailAddress,
        {
          personalisation: emailVariables,
          reference: null,
        },
      );
    });

    it('returns the response from the sendEmail method call on the notifyClient, if it is successful', async () => {
      const notifyClientSendEmailResponse = { status: 201 };

      mockNotifyClientSendEmail.mockImplementation(() => Promise.resolve(notifyClientSendEmailResponse));

      const response = await sendEmail(templateId, emailAddress, emailVariables);

      expect(response).toEqual(notifyClientSendEmailResponse);
    });

    it('returns an object with the status code from the error object from the sendEmail method call on the notifyClient, if it fails', async () => {
      const error = { response: { status: 400 } };
      const expectedResponse = { status: 400, data: 'Failed to send email' };

      mockNotifyClientSendEmail.mockImplementation(() => Promise.reject(error));

      const response = await sendEmail(templateId, emailAddress, emailVariables);

      expect(response).toEqual(expectedResponse);
    });

    it('returns an object with a 500 status code if the sendEmail method call on the notifyClient fails and the error object has no status code', async () => {
      const error = {};
      const expectedResponse = { status: 500, data: 'Failed to send email' };

      mockNotifyClientSendEmail.mockImplementation(() => Promise.reject(error));

      const response = await sendEmail(templateId, emailAddress, emailVariables);

      expect(response).toEqual(expectedResponse);
    });

    it('prints an error to the console including the data from the error object from the sendEmail method call on the notifyClient, if it fails', async () => {
      const error = { response: { data: 'some data' } };

      mockNotifyClientSendEmail.mockImplementation(() => Promise.reject(error));

      await sendEmail(templateId, emailAddress, emailVariables);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Portal API - Failed to send email %s', 'some data');
    });

    it('prints an error to the console if the sendEmail method call on the notifyClient fails and the error object has no data', async () => {
      const error = {};

      mockNotifyClientSendEmail.mockImplementation(() => Promise.reject(error));

      await sendEmail(templateId, emailAddress, emailVariables);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Portal API - Failed to send email %s', undefined);
    });
});
