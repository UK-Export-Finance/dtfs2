import { HttpStatusCode } from 'axios';
import { TestApiError } from '@ukef/dtfs2-common';
import { sendEmail } from '.';
import externalApi from '../../external-api/api';
import { TransactionFailedError } from '../../errors';

jest.mock('../../external-api/api');

describe('sendEmail', () => {
  let sendEmailSpy = jest.fn();

  const errorMessage = 'An error message';
  const errorStatus = HttpStatusCode.BadRequest;
  const testApiError = new TestApiError(errorStatus, errorMessage);

  const template = 'template';
  const email = 'test@test.com';
  const emailVariables = { variable: 'value' };

  beforeEach(() => {
    sendEmailSpy = jest.fn(() => Promise.resolve({}));
    externalApi.sendEmail = sendEmailSpy;
  });

  describe('when externalApi.sendEmail errors', () => {
    beforeEach(() => {
      jest.mocked(externalApi.sendEmail).mockRejectedValue(TransactionFailedError.forApiError(testApiError));
    });

    it('should throw an error', async () => {
      await expect(sendEmail(template, email, emailVariables)).rejects.toThrow(TransactionFailedError.forApiError(testApiError));
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
