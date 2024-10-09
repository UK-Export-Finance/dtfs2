import { sendEmail } from '.';
import externalApi from '../../external-api/api';

jest.mock('../../external-api/api');

describe('sendEmail', () => {
  let sendEmailSpy = jest.fn();

  const template = 'template';
  const email = 'test@test.com';
  const emailVariables = { variable: 'value' };

  beforeEach(() => {
    sendEmailSpy = jest.fn(() => Promise.resolve({}));
    externalApi.sendEmail = sendEmailSpy;
  });

  describe('when externalApi.sendEmail errors', () => {
    beforeEach(() => {
      jest.mocked(externalApi.sendEmail).mockRejectedValue(new Error());
    });

    it('should throw an error', async () => {
      await expect(sendEmail(template, email, emailVariables)).rejects.toThrow(new Error());
    });
  });

  describe('when an email is successfully sent', () => {
    it('should call externalApi.sendEmail once', async () => {
      await sendEmail(template, email, emailVariables);

      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    });

    it('should call externalApi.sendEmail with correct variables', async () => {
      await sendEmail(template, email, emailVariables);

      expect(sendEmailSpy).toHaveBeenCalledWith(template, email, emailVariables);
    });
  });
});
