import { HttpStatusCode } from 'axios';
import externalApi from '../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../constants/email-template-ids';
import { sendAccountSuspensionEmail } from './send-account-suspension-email';
import { MissingUserFieldsError } from '../../../../errors/missing-user-fields-error';
import { EmailSendError } from '../../../../errors/email-send-error';
import { aPortalUser } from '../../../../../test-helpers';

jest.mock('../../../../external-api/api');

describe('sendAccountSuspensionEmail', () => {
  let sendEmailSpy: jest.Mock;

  beforeEach(() => {
    sendEmailSpy = jest.fn();
    externalApi.sendEmail = sendEmailSpy;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when the user has all required fields', () => {
    it('should call externalApi.sendEmail with the correct template and email address', async () => {
      // Arrange
      const user = aPortalUser();

      // Act
      await sendAccountSuspensionEmail(user);

      // Assert
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.PORTAL_ACCOUNT_SUSPENSION_NOTIFICATION_EMAIL, user.email, {
        firstName: user.firstname,
        lastName: user.surname,
      });
    });
  });

  describe('when the user is missing required fields', () => {
    it.each([
      { description: 'email is empty', overrides: { email: '' } },
      { description: 'firstname is empty', overrides: { firstname: '' } },
      { description: 'surname is empty', overrides: { surname: '' } },
    ])('should throw a MissingUserFieldsError when $description', async ({ overrides }) => {
      // Arrange
      const user = { ...aPortalUser(), ...overrides };

      // Act + Assert
      await expect(sendAccountSuspensionEmail(user)).rejects.toThrow(MissingUserFieldsError);
    });

    it('should not call externalApi.sendEmail when required fields are missing', async () => {
      // Arrange
      const user = { ...aPortalUser(), email: '' };

      // Act + Assert
      await expect(sendAccountSuspensionEmail(user)).rejects.toThrow();

      expect(sendEmailSpy).not.toHaveBeenCalled();
    });
  });

  describe('when externalApi.sendEmail throws a non-Axios error', () => {
    beforeEach(() => {
      jest.mocked(externalApi.sendEmail).mockRejectedValue(new Error('send failed'));
    });

    it('should throw an EmailSendError', async () => {
      // Arrange
      const user = aPortalUser();

      // Act + Assert
      await expect(sendAccountSuspensionEmail(user)).rejects.toThrow(EmailSendError);
    });

    it('should throw an EmailSendError without an HTTP status', async () => {
      // Arrange
      const user = aPortalUser();

      // Act + Assert
      await expect(sendAccountSuspensionEmail(user)).rejects.toThrow('send failed');
    });
  });

  describe('when externalApi.sendEmail throws an Axios error', () => {
    beforeEach(() => {
      const axiosError = Object.assign(new Error('Bad Gateway'), {
        isAxiosError: true,
        response: { status: HttpStatusCode.BadGateway },
      });

      jest.mocked(externalApi.sendEmail).mockRejectedValue(axiosError);
    });

    it('should throw an EmailSendError with the HTTP status', async () => {
      // Arrange
      const user = aPortalUser();

      // Act + Assert
      await expect(sendAccountSuspensionEmail(user)).rejects.toThrow(`(HTTP ${HttpStatusCode.BadGateway})`);
    });
  });
});
