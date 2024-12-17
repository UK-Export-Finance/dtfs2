import { getFormattedReportPeriodWithLongMonth, mapReasonToDisplayValue, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { formatReasonsAsBulletedListForEmail, generateFeeRecordCorrectionRequestEmailParameters, sendFeeRecordCorrectionRequestEmails } from './helpers';
import { aBank, aReportPeriod } from '../../../../../../test-helpers';
import { getBankById } from '../../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../../errors';
import externalApi from '../../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../../constants/email-template-ids';

jest.mock('../../../../../repositories/banks-repo');
jest.mock('../../../../../external-api/api');

console.error = jest.fn();

describe('post-fee-record-correction.controller helpers', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const firstPaymentOfficerEmail = 'officer-1@example.com';
  const secondPaymentOfficerEmail = 'officer-2@example.com';
  const teamName = 'Payment Officer Team';

  const bank = {
    ...aBank(),
    paymentOfficerTeam: {
      teamName,
      emails: [firstPaymentOfficerEmail, secondPaymentOfficerEmail],
    },
  };

  describe('formatReasonsAsBulletedListForEmail', () => {
    it('should format reasons as a bulleted list when there is a single reasons', () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.UTILISATION_INCORRECT;
      const reasons: RecordCorrectionReason[] = [reason];

      // Act
      const result = formatReasonsAsBulletedListForEmail(reasons);

      // Assert
      const expected = `*${mapReasonToDisplayValue(reason)}`;
      expect(result).toEqual(expected);
    });

    it('should format reasons as a bulleted list when there are multiple reasons', () => {
      // Arrange
      const firstReason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;
      const secondReason = RECORD_CORRECTION_REASON.OTHER;
      const reasons: RecordCorrectionReason[] = [firstReason, secondReason];

      // Act
      const result = formatReasonsAsBulletedListForEmail(reasons);

      // Assert
      const expected = `*${mapReasonToDisplayValue(firstReason)}\n*${mapReasonToDisplayValue(secondReason)}`;
      expect(result).toEqual(expected);
    });
  });

  describe('generateFeeRecordCorrectionRequestEmailParameters', () => {
    const reasons: RecordCorrectionReason[] = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];
    const reportPeriod = aReportPeriod();
    const exporter = 'Test Exporter';
    const bankId = '123';
    const requestedByUserEmail = 'user@example.com';

    it('should generate email parameters', async () => {
      // Arrange
      jest.mocked(getBankById).mockResolvedValue(bank);

      // Act
      const result = await generateFeeRecordCorrectionRequestEmailParameters(reasons, reportPeriod, exporter, bankId, requestedByUserEmail);

      // Assert
      expect(result).toEqual({
        emails: [firstPaymentOfficerEmail, secondPaymentOfficerEmail, requestedByUserEmail],
        variables: {
          recipient: teamName,
          reportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
          exporterName: exporter,
          reasonsList: formatReasonsAsBulletedListForEmail(reasons),
        },
      });
    });

    it('should throw a NotFoundError if the bank is not found', async () => {
      // Arrange
      jest.mocked(getBankById).mockResolvedValue(null);

      // Act & Assert
      await expect(generateFeeRecordCorrectionRequestEmailParameters(reasons, reportPeriod, exporter, bankId, requestedByUserEmail)).rejects.toThrow(
        new NotFoundError(`Bank not found: ${bankId}`),
      );
      expect(console.error).toHaveBeenCalledWith('Bank not found: %s', bankId);
    });
  });

  describe('sendFeeRecordCorrectionRequestEmails', () => {
    it('should send the fee record correction request emails to bank payment officers and requested by user', async () => {
      // Arrange
      const reasons: RecordCorrectionReason[] = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];
      const reportPeriod = aReportPeriod();
      const exporter = 'Potato exporter';
      const bankId = '567';
      const requestedByUserEmail = 'tfm-user@email.com';

      jest.mocked(getBankById).mockResolvedValue(bank);

      // Act
      await sendFeeRecordCorrectionRequestEmails(reasons, reportPeriod, exporter, bankId, requestedByUserEmail);

      // Assert
      const { variables } = await generateFeeRecordCorrectionRequestEmailParameters(reasons, reportPeriod, exporter, bankId, requestedByUserEmail);
      expect(externalApi.sendEmail).toHaveBeenCalledTimes(3);
      expect(externalApi.sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_REQUEST, firstPaymentOfficerEmail, variables);
      expect(externalApi.sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_REQUEST, secondPaymentOfficerEmail, variables);
      expect(externalApi.sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_REQUEST, requestedByUserEmail, variables);
    });

    it('should return the notified email addresses', async () => {
      // Arrange
      const reasons: RecordCorrectionReason[] = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];
      const reportPeriod = aReportPeriod();
      const exporter = 'Potato exporter';
      const bankId = '567';
      const requestedByUserEmail = 'tfm-user@email.com';

      jest.mocked(getBankById).mockResolvedValue(bank);

      // Act
      const response = await sendFeeRecordCorrectionRequestEmails(reasons, reportPeriod, exporter, bankId, requestedByUserEmail);

      // Assert
      const { emails } = await generateFeeRecordCorrectionRequestEmailParameters(reasons, reportPeriod, exporter, bankId, requestedByUserEmail);

      expect(response).toEqual({ emails });
    });

    it('should throw NotFoundError error if the bank cannot be found', async () => {
      // Arrange
      const bankId = '123';
      jest.mocked(getBankById).mockResolvedValue(null);

      const expectedError = new NotFoundError(`Bank not found: ${bankId}`);

      // Act + Assert
      await expect(sendFeeRecordCorrectionRequestEmails([], aReportPeriod(), 'test exporter', bankId, 'test@test.com')).rejects.toThrow(expectedError);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Bank not found: %s', bankId);
    });

    it('should log and rethrow error if sending an email fails', async () => {
      // Arrange
      const bankId = '123';
      jest.mocked(getBankById).mockResolvedValue({
        ...aBank(),
        paymentOfficerTeam: {
          teamName,
          emails: ['test1@test.com'],
        },
      });

      const error = new Error('Failed to send second email');
      jest.mocked(externalApi.sendEmail).mockResolvedValueOnce().mockRejectedValueOnce(error);

      // Act + Assert
      await expect(sendFeeRecordCorrectionRequestEmails([], aReportPeriod(), 'test exporter', bankId, 'test2@test.com')).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith('Error sending fee record correction request email: %o', error);
    });
  });
});
