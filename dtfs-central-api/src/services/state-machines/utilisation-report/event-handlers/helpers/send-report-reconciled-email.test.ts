import { UTILISATION_REPORT_STATUS, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { SendReportReconciledEmail } from './send-report-reconciled-email';
import { generateReportReconciledEmailVariables } from './generate-report-reconciled-email-variables';
import EMAIL_TEMPLATE_IDS from '../../../../../constants/email-template-ids';
import externalApi from '../../../../../external-api/api';
import { getBankById } from '../../../../../repositories/banks-repo';
import { aBank } from '../../../../../../test-helpers';

jest.mock('../../../../../repositories/banks-repo');
jest.mock('../../../../../external-api/api');

describe('SendReportReconciledEmail', () => {
  let sendEmailSpy = jest.fn();
  const mockGetBankByIdResponse = aBank();
  mockGetBankByIdResponse.paymentOfficerTeam.emails = ['test@test.com'];

  beforeEach(() => {
    sendEmailSpy = jest.fn(() => Promise.resolve({}));
    externalApi.sendEmail = sendEmailSpy;
    jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValue(mockGetBankByIdResponse));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION).build();

  describe('when getBankById errors', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockRejectedValue(new Error());
    });

    it('should throw an error', async () => {
      await expect(SendReportReconciledEmail(utilisationReport)).rejects.toThrow(new Error());
    });
  });

  describe('when externalApi.sendEmail errors', () => {
    beforeEach(() => {
      jest.mocked(externalApi.sendEmail).mockRejectedValue(new Error());
    });

    it('should throw an error', async () => {
      await expect(SendReportReconciledEmail(utilisationReport)).rejects.toThrow(new Error());
    });
  });

  describe('when a valid report is provided and only 1 email address is returned by "generateReportReconciledEmailVariables"', () => {
    it('should call externalApi.sendEmail once', async () => {
      await SendReportReconciledEmail(utilisationReport);

      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    });

    it('should call externalApi.sendEmail with correct variables', async () => {
      await SendReportReconciledEmail(utilisationReport);

      const { emails, variables } = await generateReportReconciledEmailVariables(utilisationReport);

      expect(sendEmailSpy).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.REPORT_RECONCILED, emails[0], {
        recipient: variables.bankRecipient,
        reportPeriod: variables.reportPeriod,
        reportReconciledDate: variables.reportReconciledDate,
      });
    });
  });

  describe('when a valid report is provided and multiple emails are returned by "generateReportReconciledEmailVariables"', () => {
    const bankResponse = aBank();
    bankResponse.paymentOfficerTeam.emails = ['test@test.com', 'test2@test.com'];

    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValue(bankResponse));
    });

    it('should call externalApi.sendEmail twice', async () => {
      await SendReportReconciledEmail(utilisationReport);

      expect(sendEmailSpy).toHaveBeenCalledTimes(2);
    });

    it('should call externalApi.sendEmail with correct variables', async () => {
      await SendReportReconciledEmail(utilisationReport);

      const { emails, variables } = await generateReportReconciledEmailVariables(utilisationReport);

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
