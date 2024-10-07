import { UtilisationReportEntityMockBuilder, formatDateForEmail, getFormattedReportPeriodWithShortMonth } from '@ukef/dtfs2-common';
import { generateRecordReconciledEmailVariables } from './generate-record-reconciled-email-variables';
import { getBankById } from '../../../../../repositories/banks-repo';
import { aBank } from '../../../../../../test-helpers';

jest.mock('../../../../../repositories/banks-repo');

describe('generateRecordReconciledEmailVariables', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  const mockGetBankByIdResponse = aBank();

  describe('when getBankById errors', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockRejectedValue(new Error()));
    });

    it('should throw an error', async () => {
      await expect(generateRecordReconciledEmailVariables(utilisationReport)).rejects.toThrow(
        new Error('Error getting bank - generateRecordReconciledEmailVariables'),
      );
    });
  });

  describe('when getBankById returns no bank', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(null));
    });

    it('should throw an error', async () => {
      await expect(generateRecordReconciledEmailVariables(utilisationReport)).rejects.toThrow(
        new Error('Error getting bank - generateRecordReconciledEmailVariables'),
      );
    });
  });

  describe('when a valid report is provided', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValue(mockGetBankByIdResponse));
    });

    it('should return correct variables', async () => {
      const result = await generateRecordReconciledEmailVariables(utilisationReport);

      const { reportPeriod } = utilisationReport;

      const expected = {
        emails: mockGetBankByIdResponse.paymentOfficerTeam.emails,
        variables: {
          bankRecipient: mockGetBankByIdResponse.paymentOfficerTeam.teamName,
          reportReconciledDate: formatDateForEmail(new Date()),
          reportPeriod: getFormattedReportPeriodWithShortMonth(reportPeriod, false),
        },
      };

      expect(result).toEqual(expected);
    });
  });
});
