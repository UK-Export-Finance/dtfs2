import {
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  formatDateForEmail,
  getFormattedReportPeriodWithShortMonth,
} from '@ukef/dtfs2-common';
import { generateReportReconciledEmailVariables } from './generate-report-reconciled-email-variables';
import { getBankById } from '../../../../../repositories/banks-repo';
import { aBank } from '../../../../../../test-helpers';
import { NotFoundError } from '../../../../../errors';

jest.mock('../../../../../repositories/banks-repo');

describe('generateReportReconciledEmailVariables', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();

  const mockGetBankByIdResponse = aBank();

  const notFoundError = new NotFoundError(`Bank not found: ${utilisationReport.bankId}`);

  describe('when getBankById errors', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockRejectedValue(new Error());
    });

    it('should throw an error', async () => {
      await expect(generateReportReconciledEmailVariables(utilisationReport)).rejects.toThrow(new Error());
    });
  });

  describe('when getBankById returns no bank', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValueOnce(null));
    });

    it('should throw an error', async () => {
      await expect(generateReportReconciledEmailVariables(utilisationReport)).rejects.toThrow(notFoundError);
    });
  });

  describe('when a valid report is provided', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockImplementation(jest.fn().mockResolvedValue(mockGetBankByIdResponse));
    });

    it('should return correct variables', async () => {
      const result = await generateReportReconciledEmailVariables(utilisationReport);

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
