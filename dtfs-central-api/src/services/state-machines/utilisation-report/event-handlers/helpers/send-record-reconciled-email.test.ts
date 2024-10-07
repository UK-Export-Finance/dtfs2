import { UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { sendRecordReconciledEmail } from './send-record-reconciled-email';
import { generateRecordReconciledEmailVariables } from './generate-record-reconciled-email-variables';
import EMAIL_TEMPLATE_IDS from '../../../../../constants/email-template-ids';
import externalApi from '../../../../../external-api/api';
import { getBankById } from '../../../../../repositories/banks-repo';
import { aBank } from '../../../../../../test-helpers';

jest.mock('../../../../../repositories/banks-repo');
jest.mock('../../../../../external-api/api');

describe('sendRecordReconciledEmail', () => {
  let sendEmailSpy = jest.fn();
  const mockGetBankByIdResponse = aBank();

  beforeEach(() => {
    sendEmailSpy = jest.fn(() => Promise.resolve({}));
    externalApi.sendEmail = sendEmailSpy;
    jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValue(mockGetBankByIdResponse));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  describe('when getBankById errors', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockRejectedValue(new Error()));
    });

    it('should throw an error', async () => {
      await expect(sendRecordReconciledEmail(utilisationReport)).rejects.toThrow(
        new Error('Error sending record reconciled email - sendRecordReconciledEmail'),
      );
    });
  });

  describe('when externalApi.sendEmail errors', () => {
    beforeEach(() => {
      jest.mocked(externalApi.sendEmail).mockImplementation(jest.fn().mockRejectedValue(new Error()));
    });

    it('should throw an error', async () => {
      await expect(sendRecordReconciledEmail(utilisationReport)).rejects.toThrow(
        new Error('Error sending record reconciled email - sendRecordReconciledEmail'),
      );
    });
  });

  describe('when a valid report is provided and only 1 email address is returned by "generateRecordReconciledEmailVariables"', () => {
    it('should call externalApi.sendEmail once', async () => {
      await sendRecordReconciledEmail(utilisationReport);

      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    });

    it('should call externalApi.sendEmail with correct variables', async () => {
      await sendRecordReconciledEmail(utilisationReport);

      const { emails, variables } = await generateRecordReconciledEmailVariables(utilisationReport);

      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.REPORT_RECONCILED, emails[0], {
        recipient: variables.bankRecipient,
        reportPeriod: variables.reportPeriod,
        reportReconciledDate: variables.reportReconciledDate,
      });
    });
  });

  describe('when a valid report is provided and multiple emails are returned by "generateRecordReconciledEmailVariables"', () => {
    const bankResponse = aBank();
    bankResponse.paymentOfficerTeam.emails.push('test@test.com');

    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValue(bankResponse));
    });

    it('should call externalApi.sendEmail twice', async () => {
      await sendRecordReconciledEmail(utilisationReport);

      expect(sendEmailSpy).toHaveBeenCalledTimes(2);
    });

    it('should call externalApi.sendEmail with correct variables', async () => {
      await sendRecordReconciledEmail(utilisationReport);

      const { emails, variables } = await generateRecordReconciledEmailVariables(utilisationReport);

      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.REPORT_RECONCILED, emails[0], {
        recipient: variables.bankRecipient,
        reportPeriod: variables.reportPeriod,
        reportReconciledDate: variables.reportReconciledDate,
      });

      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.REPORT_RECONCILED, emails[1], {
        recipient: variables.bankRecipient,
        reportPeriod: variables.reportPeriod,
        reportReconciledDate: variables.reportReconciledDate,
      });
    });
  });
});
