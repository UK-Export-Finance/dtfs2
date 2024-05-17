import { BankResponse } from '../../api-response-types';
import {
  sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam,
  sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam,
} from './email-service';
import sendEmail from '../../email';
import { getBankById } from '../../api';
import { EMAIL_TEMPLATE_IDS } from '../../../constants';
import { aBank } from '../../../../test-helpers/test-data/banks';

console.error = jest.fn();
console.info = jest.fn();

jest.mock('../../api');
jest.mock('../../email');

const originalProcessEnv = process.env;

describe('emailService', () => {
  afterEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalProcessEnv };
  });

  describe('sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam', () => {
    it('should send utilisation report notification email to all emails belonging to UKEF GEF reporting team', async () => {
      // Arrange
      process.env.UKEF_GEF_REPORTING_EMAIL_RECIPIENT =
        '["email1@ukexportfinance.gov.uk", "email2@ukexportfinance.gov.uk"]';

      // Act
      await sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam('My Bank', 'June 2026');

      // Assert
      expect(sendEmail).toHaveBeenCalledTimes(2);
      expect(sendEmail).toHaveBeenCalledWith(
        EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_NOTIFICATION,
        'email1@ukexportfinance.gov.uk',
        {
          bankName: 'My Bank',
          reportPeriod: 'June 2026',
        },
      );
      expect(sendEmail).toHaveBeenCalledWith(
        EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_NOTIFICATION,
        'email2@ukexportfinance.gov.uk',
        {
          bankName: 'My Bank',
          reportPeriod: 'June 2026',
        },
      );
    });

    it('should throw an error if email recipients not provided in correct format', async () => {
      // Arrange
      process.env.UKEF_GEF_REPORTING_EMAIL_RECIPIENT = 'email1@ukexportfinance.gov.uk,email2@ukexportfinance.gov.uk';

      // Act + Assert
      await expect(
        sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam('My Bank', 'June 2026'),
      ).rejects.toThrow();
      expect(sendEmail).toHaveBeenCalledTimes(0);
    });

    it('should throw an error if email recipients not provided', async () => {
      // Arrange
      delete process.env.UKEF_GEF_REPORTING_EMAIL_RECIPIENT;

      // Act + Assert
      await expect(
        sendUtilisationReportUploadNotificationEmailToUkefGefReportingTeam('My Bank', 'June 2026'),
      ).rejects.toThrow();
      expect(sendEmail).toHaveBeenCalledTimes(0);
    });
  });

  describe('sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam', () => {
    it('should send utilisation report notification email to all emails belonging to bank payment officer team and return email addresses', async () => {
      // Arrange
      const bankId = '123';
      const submittedDate = new Date('2024-05-02T16:26:35.123Z');
      const bankResponse: BankResponse = {
        ...aBank(),
        id: bankId,
        paymentOfficerTeam: { teamName: 'My Bank Team', emails: ['email1', 'email2'] },
      };
      jest.mocked(getBankById).mockResolvedValue(bankResponse);

      // Act
      const result = await sendUtilisationReportUploadConfirmationEmailToBankPaymentOfficerTeam(
        'April 2024',
        bankId,
        submittedDate,
        'first',
        'last',
      );

      // Assert
      expect(result).toEqual({ paymentOfficerEmails: ['email1', 'email2'] });
      expect(sendEmail).toHaveBeenCalledTimes(2);
      expect(sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_CONFIRMATION, 'email1', {
        recipient: 'My Bank Team',
        reportPeriod: 'April 2024',
        reportSubmittedBy: 'first last',
        reportSubmittedDate: '2 May 2024 at 5:26 pm',
      });
      expect(sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_CONFIRMATION, 'email2', {
        recipient: 'My Bank Team',
        reportPeriod: 'April 2024',
        reportSubmittedBy: 'first last',
        reportSubmittedDate: '2 May 2024 at 5:26 pm',
      });
    });
  });
});
