import { HttpStatusCode } from 'axios';
import { UtilisationReportEntityMockBuilder, formatDateForEmail, getFormattedReportPeriodWithShortMonth, TestApiError } from '@ukef/dtfs2-common';
import { generateReportReconciledEmailVariables } from './generate-report-reconciled-email-variables';
import { getBankById } from '../../../../../repositories/banks-repo';
import { aBank } from '../../../../../../test-helpers';
import { TransactionFailedError, NotFoundError } from '../../../../../errors';

jest.mock('../../../../../repositories/banks-repo');

describe('generateReportReconciledEmailVariables', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  const mockGetBankByIdResponse = aBank();

  const errorMessage = 'An error message';
  const errorStatus = HttpStatusCode.BadRequest;
  const notFoundError = new NotFoundError('Bank not found');
  const testApiError = new TestApiError(errorStatus, errorMessage);

  describe('when getBankById errors', () => {
    beforeEach(() => {
      jest.mocked(getBankById).mockRejectedValue(TransactionFailedError.forApiError(testApiError));
    });

    it('should throw an error', async () => {
      await expect(generateReportReconciledEmailVariables(utilisationReport)).rejects.toThrow(TransactionFailedError.forApiError(testApiError));
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
